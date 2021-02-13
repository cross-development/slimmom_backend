//Models
const userModel = require('../users/user.model');
//Crypt
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Gets user credential from the request, checks email, create password hash, create a new user and return it
async function singUpUser(req, res, next) {
	try {
		const { username, email, password } = req.body;

		const user = await userModel.findOne({ email });

		if (user) {
			return res.status(409).json({ message: 'User with such email already exists' });
		}

		const encryptedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND));

		const createdUser = await userModel.create({ username, email, password: encryptedPassword });

		const token = jwt.sign({ userId: createdUser._id }, process.env.JWT_SECRET_KEY, {
			expiresIn: '24h',
		});

		const updatedUser = await userModel.findByIdAndUpdate(
			createdUser._id,
			{ token },
			{ new: true },
		);

		const response = {
			user: { userId: updatedUser._id, username, email },
			token: updatedUser.token,
		};

		return res.status(201).json(response);
	} catch (error) {
		next(error);
	}
}

//Gets user credential from the request, checks it, creates token, and return the user with the token.
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

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

		await userModel.findByIdAndUpdate(user._id, { token }, { new: true });

		const response = { token, user: { userId: user._id, username: user.username, email } };

		return res.status(201).json(response);
	} catch (error) {
		next(error);
	}
}

//Gets the userID from the request and resets the user token. Returns status 204
async function signOutUser(req, res, next) {
	try {
		await userModel.findByIdAndUpdate(req.user._id, { token: '' });

		return res.status(204).send();
	} catch (error) {
		next(error);
	}
}

module.exports = {
	singUpUser,
	signInUser,
	signOutUser,
};
