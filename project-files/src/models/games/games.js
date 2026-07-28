
import db from '../db.js';

function getRandomString(length) {
    const characters = 'abcdefghijkmnopqrstuvwxyz0123456789';
    let result = '';
    
    // Create an array of random values for better entropy
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i ++) {
        // Use the modulo operator to pick an index within our characters range
        result += characters[randomValues[i] % characters.length];
    }
    
    return result;
}

function generateGameId() {
    let gameId = getRandomString(4);
    for (let i = 0; i < 3; i ++) {
        gameId = `${gameId}-${getRandomString(4)}`;
    }
    return gameId;
}

// -----------------------------------------------------------------------
// Create a game for a user with a given id.
// -----------------------------------------------------------------------
const createGameForUserId = async (userId, stripeSessionId) => {
    let isUnique = false;
    let result;

    while (!isUnique) {
        const gameId = generateGameId();
        
        try {
            const query = `
                INSERT INTO games (id, title, gender, plays_remaining, edit_link, user_id, stripe_session_id)
                VALUES ($1, 'New Game', 'NONE', 5, 'NONE', $2, $3)
                ON CONFLICT (stripe_session_id) 
                DO UPDATE SET stripe_session_id = EXCLUDED.stripe_session_id
                RETURNING *;
            `;
            result = await db.query(query, [gameId, userId, stripeSessionId]);
            isUnique = true;
        } 
        catch (err) {
            // Check if the error is a primary key collision on the game 'id'
            // (Only happens if the generated gameId already exists for a DIFFERENT stripe session)
            if (err.code === '23505' && err.detail?.includes('Key (id)')) {
                console.warn(`Astronomical fluke! Game ID collision on ${gameId}. Retrying...`);
                continue;
            }
            throw err; // Rethrow actual systemic errors
        }
    }

    return result.rows[0];
};

// -----------------------------------------------------------------------
// Update the title and gender of a game by its id.
// -----------------------------------------------------------------------
const updateGameByGameId = async (id, title, gender, lastEditInfo) => {
    const query = `
        UPDATE games
        SET title = $2,
            gender = $3,
            last_edit_info = $4,
            last_edit_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, title, gender, last_edit_info, last_edit_at
    ;`;
    const result = await db.query(query, [id, title, gender, lastEditInfo]);
    return result.rows[0] || null;
};

// -----------------------------------------------------------------------
// Update the title of a game by its id.
// -----------------------------------------------------------------------
const updateGameTitleByGameId = async (id, title) => {
    const query = `
        UPDATE games
        SET title = $2
        WHERE id = $1
        RETURNING id, title
    ;`;
    const result = await db.query(query, [id, title]);
    return result.rows[0] || null;
};

// -----------------------------------------------------------------------
// Update the gender of a game by its id.
// -----------------------------------------------------------------------
const updateGameGenderByGameId = async (id, gender, lastEditInfo) => {
    const query = `
        UPDATE games
        SET gender = $2,
            last_edit_info = $3,
            last_edit_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, gender, last_edit_info, last_edit_at
    ;`;
    const result = await db.query(query, [id, gender, lastEditInfo]);
    return result.rows[0] || null;
};

// -----------------------------------------------------------------------
// Update the winning card of a game by its id.
// -----------------------------------------------------------------------
const updateWinningCardForGameId = async (gameId, userId, cardId, sequence) => {

    const recentWinningCard = {
        id: cardId,
        sequence: sequence
    };
    
    // 2. Update the SQL query to require BOTH game id AND user_id ownership
    const query = `
        UPDATE games
        SET last_winning_card = $3
        WHERE id = $1 AND user_id = $2
        RETURNING id, last_winning_card
    ;`;

    try {
        // 3. Pass the userId variable securely into the parameters array ($2)
        const result = await db.query(query, [
            gameId, 
            userId, 
            JSON.stringify(recentWinningCard)
        ]);
        
        // Returns the updated record if successful, 
        // or null if the gameId didn't exist OR the user didn't own it.
        return result.rows[0] || null;
    }
    catch (error) {
        console.error(`Error updating winning card for game ${gameId}:`, error);
        throw error;
    }
};

// -----------------------------------------------------------------------
// Retrieve all games that belong to a specific user.
// -----------------------------------------------------------------------
const getGamesForUserId = async (userId) => {
    
    const query = `
        SELECT
            id,
            title,
            created_at,
            plays_remaining,
            last_edit_info,
            last_edit_at
        FROM games
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    return result.rows.map(game => ({
        id: game.id,
        title: game.title,
        createdAt: new Date(game.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }),
        playsRemaining: game.plays_remaining,
        lastEditInfo: game.last_edit_info,
        lastEditAt: game.last_edit_at
    }));
};

// -----------------------------------------------------------------------
// Retrieve a game by its id.
// -----------------------------------------------------------------------
const getGameById = async (gameId) => {
    
    const query = `
        SELECT
            g.id,
            g.title,
            g.gender,
            g.plays_remaining,
            g.created_at,
            g.user_id,
            g.edit_link,
            g.last_edit_info,
            g.last_edit_at,
            g.last_winning_card,
            u.name AS owner_name
        FROM games g
        INNER JOIN users u ON g.user_id = u.id
        WHERE g.id = $1
        LIMIT 1
    `;
    
    const result = await db.query(query, [gameId]);

    // If no game is found, return null immediately instead of running .map() on an empty array
    if (result.rows.length === 0) {
        return null;
    }

    const game = result.rows[0];

    return {
        id: game.id,
        title: game.title,
        gender: game.gender,
        playsRemaining: game.plays_remaining,
        createdAt: game.created_at,
        userId: game.user_id,
        editLink: game.edit_link,
        lastEditInfo: game.last_edit_info,
        lastEditAt: game.last_edit_at,
        gameOwner: game.owner_name,
        lastWinningCard: game.last_winning_card
    };
};

// -----------------------------------------------------------------------
// Create or replace an edit link token for a specific game id.
// -----------------------------------------------------------------------
const createEditLinkForGameId = async (gameId) => {
    const newEditLink = getRandomString(14);
    const query = `
        UPDATE games
        SET edit_link = $2
        WHERE id = $1
        RETURNING id, edit_link;
    `;
    const result = await db.query(query, [gameId, newEditLink]);
    
    // Return the updated game details or null if gameId didn't exist
    return result.rows[0] || null;
};

// -----------------------------------------------------------------------
// Revert the edit link token back to 'NONE' for a specific game id.
// -----------------------------------------------------------------------
const deleteEditLinkForGameId = async (gameId) => {
    const query = `
        UPDATE games
        SET edit_link = 'NONE'
        WHERE id = $1
        RETURNING id, edit_link;
    `;
    const result = await db.query(query, [gameId]);
    
    return result.rows[0] || null;
};

export {
    createGameForUserId,
    updateGameByGameId,
    updateGameTitleByGameId,
    updateGameGenderByGameId,
    updateWinningCardForGameId,
    getGamesForUserId,
    getGameById,
    createEditLinkForGameId,
    deleteEditLinkForGameId
};
