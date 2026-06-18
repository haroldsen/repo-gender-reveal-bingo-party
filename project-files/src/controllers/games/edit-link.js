import { Router } from "express";

import { validationResult } from "express-validator";
import { editLinkValidation } from '../../middleware/validation/forms.js';

import {
    getGameById,
    deleteEditLinkForGameId,
    updateGameGenderByGameId
} from "../../models/games/games.js";
import { getUserById } from "../../models/users/users.js";

const editLinkPage = async (req, res) => {

    const { gameId, editLink } = req.params;
    const gameToEdit = await getGameById(gameId);

    // Does the game exist, and does the URL token match the active token in the database?
    if (!gameToEdit || gameToEdit.editLink.length < 10 || gameToEdit.editLink !== editLink) {
        req.flash('error', 'This edit link is invalid or has expired.');
        return res.redirect('/');
    }

    res.render('games/edit-link', {
        title: 'Set Gender | Gender Reveal Bingo Party',
        game: gameToEdit,
        editLink: editLink,
    });
}

const handleEditSubmission = async (req, res) => {

    const { gameId, editLink } = req.params;
    const gameToEdit = await getGameById(gameId);

    // Verify game existence and link matching before changing anything
    if (!gameToEdit || gameToEdit.editLink.length < 10 || gameToEdit.editLink !== editLink) {
        req.flash('error', 'This edit link is invalid or has expired.');
        return res.redirect('/');
    }

    // Check for validation errors
    const errors = validationResult(req);

    // If one or more errors exist
    if (!errors.isEmpty()) {
        // Store each validation error as a separate flash message
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect(`/edit-link/${gameId}/${editLink}`);
    }

    try {
        const { gender } = req.body;
        
        // Update the database with the gender.
        await updateGameGenderByGameId(gameId, gender, 'Via edit link');
        
        // Remove the edit link token so it can't be used again.
        await deleteEditLinkForGameId(gameId);
        
        req.flash('success', 'Thank you! The gender has been locked in!');
        
        // Redirect them to the home page.
        return res.redirect('/');
    } 
    catch (error) {
        console.error('Error handling submission:', error);
        req.flash('error', 'Unable to update game. Please try again.');
        return res.redirect(`/edit-link/${gameId}/${editLink}`);
    }
};

const editLinkRoutes = Router();

editLinkRoutes.get('/:gameId/:editLink', editLinkPage);
editLinkRoutes.post('/:gameId/:editLink', editLinkValidation, handleEditSubmission);

export default editLinkRoutes;
