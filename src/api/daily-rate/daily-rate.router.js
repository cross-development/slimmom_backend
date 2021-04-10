//Core
const { Router } = require('express');
//Controllers
const { validateToken } = require('../auth/auth.controller');
const { calculateDailyRate } = require('./daily-rate.controller');
//Helpers
const validate = require('../../helpers/validate');
const tryCatchHandler = require('../../helpers/tryCatchHandler');
const { dailyRateSchema } = require('../../helpers/validationSchemas');

const dailyRouter = Router();

// @ POST /api/daily-rate/
dailyRouter.post('/', validate(dailyRateSchema), tryCatchHandler(calculateDailyRate));

//@ POST /api/daily-rate/:userId
dailyRouter.post(
	'/:userId',
	tryCatchHandler(validateToken),
	validate(dailyRateSchema),
	tryCatchHandler(calculateDailyRate),
);

module.exports = dailyRouter;
