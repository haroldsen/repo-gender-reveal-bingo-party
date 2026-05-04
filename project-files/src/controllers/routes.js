
import { addDemoHeaders } from '../middleware/demo/headers.js';

import {
    homePage,
    aboutPage,
    getCardsPage,
    contactUsPage,
    introVideoPage,
    playableBingoCardPage
} from './index.js';

import contactRoutes from './forms/contact.js';

import { processLogout } from './forms/login.js';
import { requireLogin, requireRoleFromList } from '../middleware/auth.js';

import registrationRoutes from './forms/registration.js';
import loginRoutes from './forms/login.js';
import myGamesRoutes from './games/my-games.js';
import paymentHandlerRoutes from './stripe/stripe.js';
import dashboardRoutes from './dashboard/dashboard.js';

import { Router } from 'express';
import apiRoutes from './api/api.js';

// Create a new router instance
const router = Router();

/* ROUTE SPECIFIC MIDDLEWARE */

// Add registration-specific styles to all registration routes
router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

/* DECLARE ROUTES */

// Home and basic pages
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/contact-us', contactUsPage);
router.get('/get-cards', requireLogin, getCardsPage);
router.get('/intro-video', introVideoPage);
router.get('/bingo-card', playableBingoCardPage);

// API routes
router.use('/api', apiRoutes);

// Game management routes
router.use('/my-games', requireLogin, myGamesRoutes);

// Stripe purchase routes
router.use('/purchase-game', paymentHandlerRoutes);

// Registration routes
router.use('/register', registrationRoutes);

// Login routes (form and submission)
router.use('/login', loginRoutes);

// Authentication-related routes at root level
router.get('/logout', processLogout);

// Dashboard routes for admins and managers
router.use('/dashboard', requireLogin, requireRoleFromList(['admin', 'manager']), dashboardRoutes);

export default router;
