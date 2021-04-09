//Core
const {
	Types: { ObjectId },
} = require('mongoose');
//Validate
const Joi = require('joi');
//Configs
const configs = require('./configs');

/**
 * =============== Authentication schemas =====================================
 */
const { userPassMin, userPassMax, usernameMin, usernameMax } = configs.users;

const signUpSchema = Joi.object({
	username: Joi.string().min(usernameMin).max(usernameMax).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(userPassMin).max(userPassMax).required(),
});

const signInSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(userPassMin).max(userPassMax).required(),
});

/**
 * =============== Day schemas ==============================================
 */

const getDayInfoSchema = Joi.object({
	date: Joi.date().required(),
});

const addProductSchema = Joi.object({
	date: Joi.date().required(),
	productId: Joi.string()
		.custom((value, helpers) => {
			return !ObjectId.isValid(value) ? helpers.message({ message: 'Invalid productId' }) : value;
		})
		.required(),
	weight: Joi.number().required(),
});

const deleteProductSchema = Joi.object({
	eatenProductId: Joi.string().required(),
	dayId: Joi.string()
		.custom((value, helpers) => {
			return !ObjectId.isValid(value) ? helpers.message({ message: 'Invalid dayId' }) : value;
		})
		.required(),
});

/**
 * =============== Daily rate schemas ==============================================
 */
const {
	weightMin,
	weightMax,
	heightMin,
	heightMax,
	ageMin,
	ageMax,
	bloodType: { one, two, three, four },
} = configs.dailyRate;

const dailyRateSchema = Joi.object({
	weight: Joi.number().min(weightMin).max(weightMax).required(),
	height: Joi.number().min(heightMin).max(heightMax).required(),
	age: Joi.number().min(ageMin).max(ageMax).required(),
	desiredWeight: Joi.number().min(weightMin).max(weightMax).required(),
	bloodType: Joi.number().valid(one, two, three, four).required(),
});

/**
 * =============== Products schemas ==============================================
 */
const searchProductSchema = Joi.object({
	search: Joi.string().required(),
});

module.exports = {
	signUpSchema,
	signInSchema,

	getDayInfoSchema,
	addProductSchema,
	deleteProductSchema,

	dailyRateSchema,

	searchProductSchema,
};
