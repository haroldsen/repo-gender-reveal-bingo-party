
import { Router } from "express";

import { validationResult } from "express-validator";
import { editGameValidation } from '../../middleware/validation/forms.js';

import {
    getGamesForUserId,
    getGameById,
    updateGameByGameId,
    createEditLinkForGameId,
    deleteEditLinkForGameId
} from "../../models/games/games.js";

const myGamesPage = async (req, res) => {

    const userGames = await getGamesForUserId(req.session.user.id);

    res.addScript('<script src="/js/purchase.js" defer></script>');

    res.render('my-games', {
        title: 'My Games | Gender Reveal Bingo Party',
        games: userGames
    });
}

const playGamePage = async (req, res) => {

    res.addScript('<script type="module" src="/js/play/play.mjs" defer></script>');

    // DOES THE GAME EXIST?

    const gameToPlay = await getGameById(req.params.gameId);

    if (!gameToPlay) {
        req.flash('error', 'Game not found.');
        return res.redirect('/my-games');
    }

    // DOES THE USER OWN THE GAME?

    const doesNotOwnGame = req.session.user.id != gameToPlay.userId;

    if (doesNotOwnGame) {
        req.flash('error', 'You do not have permission to play this game.');
        return res.redirect('/my-games');
    }

    // HAS THE GENDER BEEN SET TO BOY OR GIRL?

    if (gameToPlay.gender != 'BOY' && gameToPlay.gender != 'GIRL') {
        req.flash('error', 'The gender has not been set for this game.');
        return res.redirect('/my-games');
    }

    // LAUNCH THE GAME PLAYER IF WE'VE PASSED ALL SECURITY CHECKS.
    res.render('games/play-game', {
        title: 'Play | Gender Reveal Bingo Party',
        winningGender: gameToPlay.gender
    });
}

const aboutGamePage = async (req, res) => {

    const gameToview = await getGameById(req.params.gameId);

    if (!gameToview) {
        req.flash('error', 'Game not found.');
        return res.redirect('/my-games');
    }

    const doesNotOwnGame = req.session.user.id != gameToview.userId;

    if (doesNotOwnGame) {
        req.flash('error', 'You do not have permission to view this game.');
        return res.redirect('/my-games');
    }

    res.render('games/about-game', {
        title: 'About Game | Gender Reveal Bingo Party',
        game: gameToview
    });
}

const editGamePage = async (req, res) => {

    const gameToEdit = await getGameById(req.params.gameId);

    if (!gameToEdit) {
        req.flash('error', 'Game not found.');
        return res.redirect('/my-games');
    }

    const isOwnerOfGame = req.session.user.id === gameToEdit.userId;

    if (isOwnerOfGame) {
        res.render('games/edit-game', {
            title: 'Edit Game | Gender Reveal Bingo Party',
            game: gameToEdit
        });
    } else {
        req.flash('error', 'You do not have permission to edit this game.');
        return res.redirect('/my-games');
    }
}

const handleEditGameSubmission = async (req, res) => {

    const gameId = req.params.gameId;
    const gameToEdit = await getGameById(gameId);

    // DOES THE GAME EXIST?

    if (!gameToEdit) {
        req.flash('error', 'Game not found.');
        return res.redirect('/my-games');
    }

    // DOES THE USER OWN THE GAME?

    const isOwnerOfGame = gameToEdit.userId === req.session.user.id;

    if (!isOwnerOfGame) {
        req.flash('error', 'You do not have permission to edit this game.');
        return res.redirect('/my-games');
    }

    // WERE THE EDITS VALID?

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect(`/my-games/edit-game/${gameId}`);
    }

    // UPDATE THE DATABASE

    try {
        const { title, gender } = req.body;
        await updateGameByGameId(gameId, title, gender, 'By you');
        
        req.flash('success', 'Game edited successfully!');
        return res.redirect(`/my-games/about-game/${gameId}`);
    }
    
    // CATCH DATABASE ERRORS

    catch (error) {
        console.error('Error editing game:', error);
        req.flash('error', 'Unable to edit game. Please try again later.');
        return res.redirect(`/my-games/edit-game/${gameId}`);
    }
}

const handleCreateEditLink = async (req, res) => {

    const gameId = req.params.gameId;
    const gameToEdit = await getGameById(gameId);

    // DOES THE GAME EXIST?

    if (!gameToEdit) {
        req.flash('error', 'Game not found.');
        return res.redirect('/my-games');
    }

    // DOES THE USER OWN THE GAME?

    const isOwnerOfGame = gameToEdit.userId === req.session.user.id;
    if (!isOwnerOfGame) {
        req.flash('error', 'You do not have permission to modify this game.');
        return res.redirect('/my-games');
    }

    // ATTEMPT TO CREATE THE EDIT LINK.

    try {
        await createEditLinkForGameId(gameId);
        req.flash('success', 'Successfully created a new edit link!');
    } catch (error) {
        console.error('Error creating edit link:', error);
        req.flash('error', 'Unable to generate edit link. Please try again.');
    }

    return res.redirect(`/my-games/about-game/${gameId}`);
};

const handleDeleteEditLink = async (req, res) => {

    const gameId = req.params.gameId;
    const gameToEdit = await getGameById(gameId);

    // DOES THE GAME EXIST?

    if (!gameToEdit) {
        req.flash('error', 'Game not found.');
        return res.redirect('/my-games');
    }

    // DOES THE USER OWN THE GAME?

    const isOwnerOfGame = gameToEdit.userId === req.session.user.id;
    if (!isOwnerOfGame) {
        req.flash('error', 'You do not have permission to modify this game.');
        return res.redirect('/my-games');
    }

    // ATTEMPT TO DELETE THE EDIT LINK.

    try {
        await deleteEditLinkForGameId(gameId);
        req.flash('success', 'The edit link has been deleted.');
    } catch (error) {
        console.error('Error deleting edit link:', error);
        req.flash('error', 'Unable to delete edit link. Please try again.');
    }

    return res.redirect(`/my-games/about-game/${gameId}`);
};

const myGamesRoutes = Router();

myGamesRoutes.get('/', myGamesPage);
myGamesRoutes.get('/play-game/:gameId', playGamePage);
myGamesRoutes.get('/about-game/:gameId', aboutGamePage);
myGamesRoutes.get('/edit-game/:gameId', editGamePage);
myGamesRoutes.post('/edit-game/:gameId', editGameValidation, handleEditGameSubmission);
myGamesRoutes.post('/create-edit-link/:gameId', handleCreateEditLink);
myGamesRoutes.post('/delete-edit-link/:gameId', handleDeleteEditLink);

export default myGamesRoutes;
