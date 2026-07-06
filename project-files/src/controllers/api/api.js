
import { Router } from "express";

import { searchUsersByNameAndEmail } from '../../models/users/users.js';
import { requireRoleFromList } from '../../middleware/auth.js';
import { updateWinningCardForGameId } from "../../models/games/games.js";

const apiRoutes = Router();

apiRoutes.get('/search-users', requireRoleFromList(['admin']), async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        
        // Only search if the user has typed at least 2 characters
        if (searchTerm.length < 2) {
            return res.json([]);
        }

        const users = await searchUsersByNameAndEmail(searchTerm);
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
    }
});

apiRoutes.post('/game/update-winner', async (req, res) => {
    try {
        // 1. API Session Guard: Is a user even logged in?
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        const { gameId, winningId, sequence } = req.body;
        
        // Extract the secure user ID from the server-side session
        const loggedInUserId = req.session.user.id;

        // 2. Format Validation
        if (!gameId || !winningId || !Array.isArray(sequence)) {
            return res.status(400).json({ error: 'Missing or invalid parameters.' });
        }

        // 3. Database Execution with Ownership constraint
        const updatedGame = await updateWinningCardForGameId(gameId, loggedInUserId, winningId, sequence);
        
        // 4. Secure Failure Handler
        // If null is returned, it means either the gameId doesn't exist, 
        // or the game belongs to a different userId.
        if (!updatedGame) {
            return res.status(403).json({ 
                error: 'Access denied. You do not have permission to modify this game session.' 
            });
        }

        // Success!
        res.json({ success: true, game: updatedGame });

    } catch (err) {
        console.error('Failed to sync winning card:', err);
        res.status(500).json({ error: 'Internal database sync failed.' });
    }
});

export default apiRoutes;
