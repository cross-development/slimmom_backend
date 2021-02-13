//Core
const { Router } = require('express');
//Controller
const userController = require('./user.controller');
//Helpers
const validators = require('../../helpers/validators');

const { getCurrentUser } = userController;
const { validateUserToken } = validators;

const userRouter = Router();

// @ GET /api/users/current
userRouter.get('/current', validateUserToken, getCurrentUser);

module.exports = userRouter;
