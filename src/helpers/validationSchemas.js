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
	date: Joi.string()
		.custom((value, helpers) => {
			const dateRegex = /^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})\s*$/;
			const isDateValid = dateRegex.test(value);

			return !isDateValid
				? helpers.message({ message: "Invalid 'date'. It should be dd.mm.yyyy string format" })
				: value;
		})
		.required(),
});

const addProductSchema = Joi.object({
	date: Joi.string()
		.custom((value, helpers) => {
			const dateRegex = /^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})\s*$/;
			const isDateValid = dateRegex.test(value);

			return !isDateValid
				? helpers.message({ message: "Invalid 'date'. It should be dd.mm.yyyy string format" })
				: value;
		})
		.required(),
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
