
import db from '../db.js';


/**
 * Generates a random alphanumeric string (lowercase letters and numbers).
 * @param {number} length - The desired length of the string.
 * @returns {string} The generated random string.
 */
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

/**
 * Saves a new user to the database with a hashed password.
 * 
 * @param {string} name - The user's full name
 * @param {string} email - The user's email address
 * @param {string} hashedPassword - The bcrypt-hashed password
 * @returns {Promise<Object>} The newly created user record (without password)
 */
const createGameForUserId = async (userId, stripeSessionId) => {
    let isUnique = false;
    let result;

    while (!isUnique) {
        const gameId = getRandomString(25);
        try {
            const query = `
                INSERT INTO games (id, title, gender, is_playable, created_at, user_id, stripe_session_id)
                VALUES ($1, 'New Game', 'BOY', true, CURRENT_TIMESTAMP, $2, $3)
                ON CONFLICT (stripe_session_id) DO NOTHING
                RETURNING *;
            `;
            result = await db.query(query, [gameId, userId, stripeSessionId]);

            // Break the while loop if the insert succeeded (meaning the id was unique)
            isUnique = true;
        }

        // If there was an insert fail
        catch (err) {

            // Check if the error is a 'unique_violation' (Postgres error code 23505)
            if (err.code === '23505') {
                console.warn("Collision detected, retrying...");
                continue;
            }
            throw err; // Re-throw if it's a different database error
        }
    }
    return result.rows[0];
};

/**
 * Update a user's name and email
 */
const updateGameByGameId = async (id, title, gender) => {
    const query = `
        UPDATE games
        SET title = $2, gender = $3
        WHERE id = $1
        RETURNING id, title, gender;
    `;
    const result = await db.query(query, [id, title, gender]);
    return result.rows[0] || null;
};

/**
 * Get all faculty members in a specific department.
 * 
 * @param {number} departmentId - The ID of the department
 * @param {string} sortBy - Sort option: 'name' (default), 'department', 'title'
 * @returns {Promise<Array>} Array of faculty objects in the specified department
 */
const getGamesForUserId = async (userId) => {
    
    const query = `
        SELECT id, title, created_at, is_playable
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
        isPlayable: game.is_playable
    }));
};

/**
 * Get all faculty members in a specific department.
 * 
 * @param {number} departmentId - The ID of the department
 * @param {string} sortBy - Sort option: 'name' (default), 'department', 'title'
 * @returns {Promise<Array>} Array of faculty objects in the specified department
 */
const getGameById = async (gameId) => {
    
    const query = `
        SELECT
            id,
            title,
            gender,
            is_playable,
            created_at,
            user_id
        FROM games
        WHERE id = $1
        LIMIT 1
    `;
    
    const result = await db.query(query, [gameId]);

    const objectList = result.rows.map(game => ({
        id: game.id,
        title: game.title,
        gender: game.gender,
        isPlayable: game.is_playable,
        createdAt: game.created_at,
        userId: game.user_id
    }));

    return objectList[0];
};

/**
 * Wrapper functions for cleaner API - these make the code more readable at the call site.
 * Example: getFacultyById(5) is clearer than getFaculty(5, 'id')
 */
// const getFacultyById = (facultyId) => getFaculty(facultyId, 'id');
// const getFacultyBySlug = (facultySlug) => getFaculty(facultySlug, 'slug');

export { createGameForUserId, updateGameByGameId, getGamesForUserId, getGameById };
