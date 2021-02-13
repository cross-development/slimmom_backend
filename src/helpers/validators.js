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

async function validateProductQuery(req, res, next) {
	const createQueryRules = Joi.object({
		search: Joi.string().required(),
	});

	const validatedRegister = createQueryRules.validate(req.query);

	if (validatedRegister.error) {
		const message = validatedRegister.error.details[0].message;

		return res.status(400).json({ message });
	}

	next();
}

//The middleware validate id
function validateId(req, res, next) {
	const { id } = req.params;

	if (!ObjectId.isValid(id)) {
		return res.status(400).send({ message: 'invalid id' });
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
	checkDailyRate,
};
