//Core
const { Router } = require('express');
//Controllers
const authController = require('./auth.controller');
//Helpers
const validators = require('../../helpers/validators');

const { singUpUser, signInUser, signOutUser } = authController;
const { validateSignUpUser, validateSignInUser, validateUserToken } = validators;

const authRouter = Router();

// @ POST /api/auth/sign-up
authRouter.post('/sign-up', validateSignUpUser, singUpUser);

// @ POST /api/auth/sign-in
authRouter.post('/sign-in', validateSignInUser, signInUser);

// @ DELETE /api/auth/sign-out
authRouter.delete('/sign-out', validateUserToken, signOutUser);

module.exports = authRouter;
