
import { Router } from "express";

import { validationResult } from "express-validator";
import { editGameValidation } from '../../middleware/validation/forms.js';

import { getGamesForUserId, getGameById, updateGameByGameId } from "../../models/games/games.js";

const myGamesPage = async (req, res) => {

    const userGames = await getGamesForUserId(req.session.user.id);

    res.addScript('<script src="/js/purchase.js" defer></script>');

    res.render('my-games', {
        title: 'My Games | Gender Reveal Bingo Party',
        games: userGames
    });
}

const playGamePage = async (req, res) => {

    res.addScript('<script type="module" src="/js/play/play.js" defer></script>');

    // DOES THE GAME EXIST?

    const gameToPlay = await getGameById(req.params.gameId);

    if (!gameToPlay) {
        req.flash('error', 'Game not found.');
        return res.redirect('/my-games');
    }

    // DOES THE USER OWN THE GAME?

    const gameUserId = gameToPlay.userId;

    const isOwnerOfGame = req.session.user.id === gameUserId;

    if (isOwnerOfGame) {
        res.render('games/play-game', {
            title: 'Play | Gender Reveal Bingo Party',
            winningGender: gameToPlay.gender
        });
    } else {
        req.flash('error', 'You do not have permission to play this game.');
        return res.redirect('/my-games');
    }
}

const editGamePage = async (req, res) => {

    const gameToEdit = await getGameById(req.params.gameId);

    if (!gameToEdit) {
        req.flash('error', 'Game not found.');
        return res.redirect('/my-games');
    }

    const gameUserId = gameToEdit.userId;
    const previousTitle = gameToEdit.title;

    const isOwnerOfGame = req.session.user.id === gameUserId;

    if (isOwnerOfGame) {
        res.render('games/edit-game', {
            title: 'Edit Game | Gender Reveal Bingo Party',
            previousTitle: previousTitle,
            gameId: req.params.gameId
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
        await updateGameByGameId(gameId, title, gender);
        
        req.flash('success', 'Game edited successfully!');
        return res.redirect('/my-games');
    }
    
    // CATCH DATABASE ERRORS

    catch (error) {
        console.error('Error editing game:', error);
        req.flash('error', 'Unable to edit game. Please try again later.');
        return res.redirect(`/my-games/edit-game/${gameId}`);
    }
}

const myGamesRoutes = Router();

myGamesRoutes.get('/', myGamesPage);
myGamesRoutes.get('/play-game/:gameId', playGamePage);
myGamesRoutes.get('/edit-game/:gameId', editGamePage);
myGamesRoutes.post('/edit-game/:gameId', editGameValidation, handleEditGameSubmission);

export default myGamesRoutes;
