// backend/src/api/services/userService.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userRepository = require('../repositories/userRepository');
const AppError = require('../../utils/AppError');

// --- Service-level constants for error messages ---
const AUTH_CONFIG_ERROR = 'Error de configuración interna del servidor.';
const INVALID_CREDENTIALS_ERROR = 'El correo electrónico o la contraseña son incorrectos.';

/**
 * Service layer for user-related business logic.
 */
class UserService {
    /**
     * Retrieves a user by their ID.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<User>} The user object without the password.
     */
    async getUserById(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
        throw new AppError('Usuario no encontrado.', 404);
    }
        // Exclude password from the returned object
        const { password, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    /**
     * Creates a new user.
     * @param {object} userData - User data (username, email, password).
     * @returns {Promise<User>} The newly created user object.
     */
    async createUser(userData) {
        // Validation to avoid duplicate email or username.
        if (await userRepository.findByEmail(userData.email)) {
            throw new AppError('El correo electrónico proporcionado ya está registrado.', 409);
        }
        if (await userRepository.findByUsername(userData.username)) {
            throw new AppError('El nombre de usuario ya está en uso.', 409);
        }

        // Pass data directly to the repository. The model hook will handle password hashing.
        // DO NOT HASH THE PASSWORD HERE to avoid double hashing.
        const newUser = await userRepository.create(userData);
        return newUser;
    }

    /**
     * Authenticates a user and returns a JWT.
     * @param {string} email - User's email.
     * @param {string} password - User's password.
     * @returns {Promise<{token: string, user: object}>} An object with the token and user data.
     */
    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new AppError(INVALID_CREDENTIALS_ERROR, 401);
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            throw new AppError(INVALID_CREDENTIALS_ERROR, 401);
        }

        const token = this.generateAuthToken(user);
        const { password: _, ...userWithoutPassword } = user.toJSON();
        
        return { token, user: userWithoutPassword };
    }

    /**
     * Updates a user's information.
     * @param {number} userId - The ID of the user to update.
     * @param {object} userData - The data to update.
     * @returns {Promise<User>} The updated user object.
     */
    async updateUser(userId, userData) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado para actualizar.', 404);
        }

        // If updating the password, pass it in plain text. The model hook will hash it.
        const updatedCount = await userRepository.update(userId, userData);

        if (updatedCount > 0) {
            // Refresh the user data to return the updated object.
            const updatedUser = await this.getUserById(userId);
            return updatedUser;
        }
        
        // If no rows were updated, return the user unchanged.
        const { password, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    /**
     * Deletes a user.
     * @param {number} userId - The ID of the user to delete.
     * @returns {Promise<{message: string}>} A confirmation message.
     */
    async deleteUser(userId) {
        const deletedCount = await userRepository.delete(userId);
        if (deletedCount === 0) {
            throw new AppError('Usuario no encontrado para eliminar.', 404);
        }
        return { message: 'Usuario eliminado con éxito.' };
    }

    /**
     * Generates a JWT for a given user.
     * @param {User} user - The user instance.
     * @returns {string} The generated JWT.
     */
    generateAuthToken(user) {
        const payload = { id: user.id, username: user.username, email: user.email };
        const secret = process.env.NODE_ENV === 'test' 
            ? process.env.JWT_SECRET_TEST 
            : process.env.JWT_SECRET;
        const options = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };

        if (!secret) {
            console.error("FATAL: JWT_SECRET is not defined in environment variables.");
            throw new AppError(AUTH_CONFIG_ERROR, 500);
        }
        
        return jwt.sign(payload, secret, options);
    }
}

module.exports = new UserService();