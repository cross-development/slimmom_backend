//Core
const { Router } = require('express');
//Controllers
const productController = require('./product.controller');
//Helpers
const validators = require('../../helpers/validators');

const { validateUserToken, checkDailyRate, validateProductQuery } = validators;
const { findProducts } = productController;

const productRouter = Router();

productRouter.get('/', validateUserToken, checkDailyRate, validateProductQuery, findProducts);

module.exports = productRouter;
