
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
        if (i < length - 1 && (i + 1) % 5 == 0) {
            result += '-';
        }
    }
    
    return result;
}

// -----------------------------------------------------------------------
// Create a game for a user with a given id.
// -----------------------------------------------------------------------
const createGameForUserId = async (userId, stripeSessionId) => {
    let isUnique = false;
    let result;

    while (!isUnique) {
        const gameId = getRandomString(25);
        
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
            id,
            title,
            gender,
            plays_remaining,
            created_at,
            user_id,
            edit_link,
            last_edit_info,
            last_edit_at
        FROM games
        WHERE id = $1
        LIMIT 1
    `;
    
    const result = await db.query(query, [gameId]);

    const objectList = result.rows.map(game => ({
        id: game.id,
        title: game.title,
        gender: game.gender,
        playsRemaining: game.plays_remaining,
        createdAt: game.created_at,
        userId: game.user_id,
        editLink: game.edit_link,
        lastEditInfo: game.last_edit_info,
        lastEditAt: game.last_edit_at
    }));

    return objectList[0];
};

export {
    createGameForUserId,
    updateGameByGameId,
    getGamesForUserId,
    getGameById
};
