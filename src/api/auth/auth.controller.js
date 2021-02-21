//Models
const userModel = require('../user/user.model');
const summaryModel = require('../summary/summary.model');
//Crypt
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//Utils
const getCurrentDate = require('../../utils/prettyDate');

/**
 * Gets user credential from the request, checks email, create password hash,
 * create a new user and return it
 * */
async function singUpUser(req, res, next) {
	try {
		const { username, email, password } = req.body;

		const user = await userModel.findOne({ email });

		if (user) {
			return res.status(409).json({ message: 'User with such email already exists' });
		}

		const encryptedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND));

		const createdUser = await userModel.create({
			username,
			email,
			password: encryptedPassword,
			userData: {
				weight: 0,
				height: 0,
				age: 0,
				bloodType: 0,
				desiredWeight: 0,
				dailyRate: 0,
				notAllowedProducts: [],
			},
			days: [],
		});

		return res.status(201).json({ user: { userId: createdUser._id, username, email } });
	} catch (error) {
		next(error);
	}
}

/**
 * Gets user credential from the request, checks it, creates token,
 * and return the user with the token.
 * */
async function signInUser(req, res, next) {
	try {
		const { email, password } = req.body;

		const user = await userModel.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: 'User with such email not found' });
		}

		const isUserPasswordCorrect = await bcrypt.compare(password, user.password);

		if (!isUserPasswordCorrect) {
			return res.status(403).json({ message: 'Provided password is incorrect' });
		}

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
			expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
		});

		await userModel.findByIdAndUpdate(user._id, { token }, { new: true });

		const currentDate = getCurrentDate();
		const todaySummary = await summaryModel.findOne({ date: currentDate });

		if (!todaySummary) {
			return res.status(200).json({
				token,
				todaySummary: {},
				user: {
					userId: user._id,
					email: user.email,
					username: user.username,
					userData: user.userData,
				},
			});
		}

		const response = {
			token,
			todaySummary: {
				date: todaySummary.date,
				kcalLeft: todaySummary.kcalLeft,
				kcalConsumed: todaySummary.kcalConsumed,
				dailyRate: todaySummary.dailyRate,
				percentsOfDailyRate: todaySummary.percentsOfDailyRate,
				userId: todaySummary.userId,
				id: todaySummary._id,
			},
			user: {
				userId: user._id,
				email: user.email,
				username: user.username,
				userData: user.userData,
			},
		};

		return res.status(200).json(response);
	} catch (error) {
		next(error);
	}
}

/**
 * Gets the userID from the request and resets the user token.
 * Returns status 204
 * */
async function signOutUser(req, res, next) {
	try {
		await userModel.findByIdAndUpdate(req.user._id, { token: '' });

		return res.status(204).send();
	} catch (error) {
		next(error);
	}
}

module.exports = { singUpUser, signInUser, signOutUser };
