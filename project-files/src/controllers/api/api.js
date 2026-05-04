
import { Router } from "express";

import { searchUsersByNameAndEmail } from '../../models/users/users.js';
import { requireRoleFromList } from '../../middleware/auth.js';

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

export default apiRoutes;
