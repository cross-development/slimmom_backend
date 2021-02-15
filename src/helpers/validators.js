//Core
const {
	Types: { ObjectId },
} = require('mongoose');
//Models
const userModel = require('../api/user/user.model');
//Validate
const Joi = require('joi');
//Configs
const configs = require('../configs');
//Crypt
const jwt = require('jsonwebtoken');

const {
	userPassLengthMin,
	userPassLengthMax,
	usernameLengthMin,
	usernameLengthMax,
} = configs.users;

const {
	weightMin,
	weightMax,
	heightMin,
	heightMax,
	ageMin,
	ageMax,
	bloodType: { one, two, three, four },
} = configs.dailyRate;

//The middleware validate to register user
function validateSignUpUser(req, res, next) {
	const createRegisterRules = Joi.object({
		username: Joi.string().min(usernameLengthMin).max(usernameLengthMax).required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(userPassLengthMin).max(userPassLengthMax).required(),
	});

	const validatedRegister = createRegisterRules.validate(req.body);

	if (validatedRegister.error) {
		const message = validatedRegister.error.details[0].message;

		return res.status(400).json({ message });
	}

	next();
}

//The middleware validate to login user
function validateSignInUser(req, res, next) {
	const createLoginRules = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(userPassLengthMin).max(userPassLengthMax).required(),
	});

	const validatedLogin = createLoginRules.validate(req.body);

	if (validatedLogin.error) {
		const message = validatedLogin.error.details[0].message;

		return res.status(400).json({ message });
	}

	next();
}

//The middleware validate user token
async function validateUserToken(req, res, next) {
	try {
		const authorizationHeader = req.get('Authorization') || '';
		const token = authorizationHeader.replace('Bearer ', '');

		try {
			const userId = await jwt.verify(token, process.env.JWT_SECRET_KEY).userId;
			const user = await userModel.findById(userId);

			if (!user || user.token !== token) {
				return res.status(401).json({ message: 'Bearer auth failed' });
			}

			req.user = user;

			next();
		} catch (err) {
			return res.status(401).json({ message: 'Bearer auth failed' });
		}
	} catch (err) {
		next(err);
	}
}

// The middleware validate search query
async function validateProductQuery(req, res, next) {
	const createQueryRules = Joi.object({
		search: Joi.string().required(),
	});

	const validatedQuery = createQueryRules.validate(req.query);

	if (validatedQuery.error) {
		const message = validatedQuery.error.details[0].message;

		return res.status(400).json({ message });
	}

	next();
}

//The middleware validate daily rate credentials
function validateDailyRate(req, res, next) {
	const createDailyRateRules = Joi.object({
		weight: Joi.number().min(weightMin).max(weightMax).required(),
		height: Joi.number().min(heightMin).max(heightMax).required(),
		age: Joi.number().min(ageMin).max(ageMax).required(),
		desiredWeight: Joi.number().min(weightMin).max(weightMax).required(),
		bloodType: Joi.number().valid(one, two, three, four).required(),
	});

	const validatedDailyRate = createDailyRateRules.validate(req.body);

	if (validatedDailyRate.error) {
		const message = validatedDailyRate.error.details[0].message;

		return res.status(400).json({ message });
	}

	next();
}

//The middleware validate userId
function validateId(req, res, next) {
	const { userId } = req.params;

	if (!ObjectId.isValid(userId)) {
		return res.status(400).send({ message: 'invalid userId' });
	}

	next();
}

//The middleware checks selected daily rate
function checkDailyRate(req, res, next) {
	const { userData } = req.user;

	if (!userData.dailyRate) {
		return res.status(403).send({ message: 'Please, count your daily rate first' });
	}

	next();
}

//The middleware validate add product to user summary
function validateAddProduct(req, res, next) {
	const addProductRules = Joi.object({
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

	const validatedAddProduct = addProductRules.validate(req.body);

	if (validatedAddProduct.error) {
		const message = validatedAddProduct.error.details[0].message;

		return res.status(400).json({ message });
	}

	next();
}

//The middleware validate delete product from user summary
function validateDeleteProduct(req, res, next) {
	const deleteProductRules = Joi.object({
		eatenProductId: Joi.string().required(),
		dayId: Joi.string()
			.custom((value, helpers) => {
				return !ObjectId.isValid(value) ? helpers.message({ message: 'Invalid dayId' }) : value;
			})
			.required(),
	});

	const validatedDeleteProduct = deleteProductRules.validate(req.body);

	if (validatedDeleteProduct.error) {
		const message = validatedDeleteProduct.error.details[0].message;

		return res.status(400).json({ message });
	}

	next();
}

//The middleware validate get day info from user summary
function validateDayInfo(req, res, next) {
	const getDayInfoRules = Joi.object({
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

	const validatedDayInfo = getDayInfoRules.validate(req.body);

	if (validatedDayInfo.error) {
		const message = validatedDayInfo.error.details[0].message;

		return res.status(400).json({ message });
	}

	next();
}

module.exports = {
	validateSignUpUser,
	validateSignInUser,
	validateUserToken,
	validateId,
	validateProductQuery,
	validateDailyRate,
	checkDailyRate,
	validateAddProduct,
	validateDeleteProduct,
	validateDayInfo,
};
