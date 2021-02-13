//Models
const userModel = require('./user.model');
const summaryModel = require('../summary/summary.model');

/**
 * Gets user credential from request and returns the current user
 * with summary info
 */
async function getCurrentUser(req, res, next) {
	try {
		const currentUser = await userModel.findOne({ _id: req.user._id }).populate({
			path: 'days',
			populate: [{ path: 'daySummary', model: summaryModel }],
		});

		const { username, email, _id, userData, days } = currentUser;

		return res.status(200).json({ userId: _id, username, email, userData, days });
	} catch (error) {
		next(error);
	}
}

module.exports = { getCurrentUser };
