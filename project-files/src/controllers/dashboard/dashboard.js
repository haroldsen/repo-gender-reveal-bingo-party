
import { Router } from "express";

import { requireRoleFromList } from "../../middleware/auth.js";

import { createGameForUserId, getGamesForUserId } from "../../models/games/games.js";

import { getUserById } from "../../models/users/users.js";

const dashboardPage = async (req, res) => {

    res.addScript('<script src="/js/dashboard.js" defer></script>');
    
    res.render('dashboard/dashboard', { title: 'Dashboard | Gender Reveal Bingo Party' });
};

const viewAccountPage = async (req, res) => {

    const selectedUser = await getUserById(req.params.userId);

    const gamesForUser = await getGamesForUserId(selectedUser.id);

    res.render('dashboard/view-account', {
        title: 'View Account | Gender Reveal Bingo Party',
        selectedUser: selectedUser,
        games: gamesForUser
    });
};

const handleGiftGame = async (req, res) => {
    const targetUserId = req.params.userId;

    try {

        // DOES THE USER EXIST?

        const targetUser = await getUserById(targetUserId);
        if (!targetUser) {
            req.flash('error', 'Gift failed: Target user not found.');
            return res.redirect(`/dashboard/view-account/${req.params.userId}`);
        }

        // ATTEMPT TO GIFT A SESSION TO THE USER

        // Generate a fake Stripe ID manually
        const manualStripeId = `GIFT_${Date.now()}_${targetUserId}`;
        
        // Gift the session to the target user
        const newGame = await createGameForUserId(targetUserId, manualStripeId);

        // Tell the user if the insert succeeded
        if (newGame) {
            req.flash('success', `Game successfully gifted to ${targetUser.name}!`);
        } else {
            req.flash('error', 'Game was not created (it might already exist for this session).');
        }

        return res.redirect(`/dashboard/view-account/${req.params.userId}`);

    }
    
    // CATCH THE ERROR IF THERE WAS ONE

    catch (error) {
        console.error('Error gifting game:', error);
        req.flash('error', 'A server error occurred while creating the game.');
        return res.redirect(`/dashboard/view-account/${req.params.userId}`);
    }
};

const dashboardRoutes = Router();

dashboardRoutes.get('/', dashboardPage);
dashboardRoutes.get('/view-account/:userId', viewAccountPage);
dashboardRoutes.post('/view-account/:userId/gift-session', handleGiftGame);

export default dashboardRoutes;
