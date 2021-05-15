//Models
const userModel = require('../user/user.model');
const summaryModel = require('../summary/summary.model');
//Crypt
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Gets user credential from the request, checks email, create password hash,
 * create a new user and return it
 * */
async function singUpUser(req, res) {
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

	return res.status(201).json({
		userId: createdUser._id,
		username,
		email,
	});
}

/**
 * Gets user credential from the request, checks it, creates token,
 * and return the user with the token.
 * */
async function signInUser(req, res) {
	const { email, password } = req.body;

	const user = await userModel.findOne({ email });

	if (!user) {
		return res.status(404).send({ message: 'User with such email not found' });
	}

	const isUserPasswordCorrect = await bcrypt.compare(password, user.password);

	if (!isUserPasswordCorrect) {
		return res.status(403).json({ message: 'Provided password is incorrect' });
	}

	const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
		expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
	});

	await userModel.findByIdAndUpdate(user._id, { token }, { new: true });

	const currentDate = new Date().toLocaleDateString('us-US');
	const todaySummary = await summaryModel.findOne({ date: currentDate });

	if (!todaySummary) {
		return res.status(200).json({
			token,
			todaySummary: {
				eatenProducts: [],
				date: currentDate,
				kcalLeft: user.userData.dailyRate,
				kcalConsumed: 0,
				dailyRate: user.userData.dailyRate,
				percentsOfDailyRate: 0,
			},
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
		user: {
			userId: user._id,
			email: user.email,
			username: user.username,
			userData: user.userData,
		},
		todaySummary: {
			date: todaySummary.date,
			kcalLeft: todaySummary.kcalLeft,
			kcalConsumed: todaySummary.kcalConsumed,
			dailyRate: todaySummary.dailyRate,
			percentsOfDailyRate: todaySummary.percentsOfDailyRate,
		},
	};

	return res.status(200).json(response);
}

/**
 * Gets the userID from the request and resets the user token.
 * Returns status 204
 * */
async function signOutUser(req, res) {
	await userModel.findByIdAndUpdate(req.user._id, { token: '' });
	req.user = null;

	return res.status(204).end();
}

//Validate user token
async function validateToken(req, res, next) {
	const authorizationHeader = req.get('Authorization') || '';
	const token = authorizationHeader.replace('Bearer ', '');

	try {
		const userId = await jwt.verify(token, process.env.JWT_SECRET_KEY).userId;
		const user = await userModel.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'Invalid user' });
		}

		if (user.token !== token) {
			return res.status(401).json({ message: 'Bearer auth failed' });
		}

		req.user = user;

		next();
	} catch (err) {
		return res.status(400).json({ message: 'No token provided' });
	}
}

module.exports = { singUpUser, signInUser, signOutUser, validateToken };
