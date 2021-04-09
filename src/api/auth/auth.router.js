//Core
const { Router } = require('express');
//Controllers
const authController = require('./auth.controller');
//Helpers
const validate = require('../../helpers/validate');
const tryCatchHandler = require('../../helpers/tryCatchHandler');
const { signUpSchema, signInSchema } = require('../../helpers/validationSchemas');

const { singUpUser, signInUser, signOutUser, validateToken } = authController;

const authRouter = Router();

// @ POST /api/auth/sign-up
authRouter.post('/sign-up', validate(signUpSchema), tryCatchHandler(singUpUser));

// @ POST /api/auth/sign-in
authRouter.post('/sign-in', validate(signInSchema), tryCatchHandler(signInUser));

// @ DELETE /api/auth/sign-out
authRouter.delete('/sign-out', tryCatchHandler(validateToken), tryCatchHandler(signOutUser));

module.exports = authRouter;
