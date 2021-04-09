//Core
const { Router } = require('express');
//Controllers
const { findProducts } = require('./product.controller');
const { validateToken, checkDailyRate } = require('../auth/auth.controller');
//Helpers
const validate = require('../../helpers/validate');
const tryCatchHandler = require('../../helpers/tryCatchHandler');
const { searchProductSchema } = require('../../helpers/validationSchemas');

const productRouter = Router();

// @ GET /api/product
productRouter.get(
	'/',
	tryCatchHandler(validateToken),
	tryCatchHandler(checkDailyRate),
	validate(searchProductSchema, 'query'),
	tryCatchHandler(findProducts),
);

module.exports = productRouter;
