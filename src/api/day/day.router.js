//Core
const { Router } = require('express');
//Controllers
const { validateToken } = require('../auth/auth.controller');
const dayController = require('./day.controller');
//Helpers
const validate = require('../../helpers/validate');
const tryCatchHandler = require('../../helpers/tryCatchHandler');
const validationSchemas = require('../../helpers/validationSchemas');

const { addProductSchema, deleteProductSchema, getDayInfoSchema } = validationSchemas;
const { addProduct, deleteProduct, getDayInfo, checkDailyRate } = dayController;

const dayRouter = Router();

// @POST /api/day/add
dayRouter.post(
	'/add',
	tryCatchHandler(validateToken),
	tryCatchHandler(checkDailyRate),
	validate(addProductSchema),
	tryCatchHandler(addProduct),
);

// @POST /api/day/delete
dayRouter.post(
	'/delete',
	tryCatchHandler(validateToken),
	tryCatchHandler(checkDailyRate),
	validate(deleteProductSchema),
	tryCatchHandler(deleteProduct),
);

// @POST /api/day/info
dayRouter.post(
	'/info',
	tryCatchHandler(validateToken),
	tryCatchHandler(checkDailyRate),
	validate(getDayInfoSchema),
	tryCatchHandler(getDayInfo),
);

module.exports = dayRouter;
