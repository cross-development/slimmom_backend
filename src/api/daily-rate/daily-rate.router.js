//Core
const { Router } = require('express');
//Controllers
const dailyRateController = require('./daily-rate.controller');
//Helpers
const validators = require('../../helpers/validators');

const { calculateDailyRate } = dailyRateController;

const { validateUserToken, validateId, validateDailyRate } = validators;

const dailyRouter = Router();

// @ POST /api/daily-rate/
dailyRouter.post('/', validateDailyRate, calculateDailyRate);

//@ POST /api/daily-rate/:userId
dailyRouter.post('/:userId', validateUserToken, validateId, validateDailyRate, calculateDailyRate);

module.exports = dailyRouter;
