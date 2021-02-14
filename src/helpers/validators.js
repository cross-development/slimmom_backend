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

//The middleware validate user daily rate
function checkDailyRate(req, res, next) {
	const { userData } = req.user;

	if (!userData.dailyRate) {
		return res.status(403).send({ message: 'Please, count your daily rate first' });
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
};
