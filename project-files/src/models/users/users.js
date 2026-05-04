import bcrypt from 'bcrypt';
import db from '../db.js';

const searchUsersByNameAndEmail = async (searchTerm) => {
    const query = `
        SELECT
            users.id,
            users.name,
            users.email,
            users.created_at,
            roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE name ILIKE '%' || $1 || '%'
           OR email ILIKE '%' || $1 || '%'
    ;`;

    const result = await db.query(query, [searchTerm]);
    
    return result.rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roleName: user.roleName,
        createdAt: new Date(user.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }));
}

/**
 * Find a user by email address for login verification.
 * 
 * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} User object with password hash or null if not found
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT 
            users.id, 
            users.name, 
            users.email, 
            users.password, 
            users.created_at,
            roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE LOWER(users.email) = LOWER($1)
        LIMIT 1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
};

/**
 * Find a user by their user id.
 * 
 * @param {string} id - Id to search for
 * @returns {Promise<Object|null>} User object with password hash or null if not found
 */
const getUserById = async (id) => {
    const query = `
        SELECT
            users.id,
            users.name,
            users.email,
            users.created_at,
            roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1
        LIMIT 1
    ;`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Verify a plain text password against a stored bcrypt hash.
 * 
 * @param {string} plainPassword - The password to verify
 * @param {string} hashedPassword - The stored password hash
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    let isVerified = await bcrypt.compare(plainPassword, hashedPassword);
    return isVerified;
};

export { findUserByEmail, verifyPassword, searchUsersByNameAndEmail, getUserById };
