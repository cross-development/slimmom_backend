//Core
const { Router } = require('express');
//Controller
const { getCurrentUser } = require('./user.controller');
const { validateToken } = require('../auth/auth.controller');
//Helpers
const tryCatchHandler = require('../../helpers/tryCatchHandler');

const userRouter = Router();

// @ GET /api/users/current
userRouter.get('/current', tryCatchHandler(validateToken), tryCatchHandler(getCurrentUser));

module.exports = userRouter;
