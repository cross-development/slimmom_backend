//Core
const { Router } = require('express');
//Controllers
const dayController = require('./day.controller');
//Helpers
const validators = require('../../helpers/validators');

const {
	validateUserToken,
	checkDailyRate,
	validateAddProduct,
	validateDeleteProduct,
	validateDayInfo,
} = validators;

const { addProduct, deleteProduct, getDayInfo } = dayController;

const dayRouter = Router();

// @POST /api/day/add
dayRouter.post('/add', validateUserToken, checkDailyRate, validateAddProduct, addProduct);

// @POST /api/day/delete
dayRouter.post('/delete', validateUserToken, checkDailyRate, validateDeleteProduct, deleteProduct);

// @POST /api/day/info
dayRouter.post('/info', validateUserToken, checkDailyRate, validateDayInfo, getDayInfo);

module.exports = dayRouter;
