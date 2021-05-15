//Models
const userModel = require('./user.model');
const summaryModel = require('../summary/summary.model');
const dayModel = require('../day/day.model');

/**
 * Gets user credential from request and returns the current user
 * with summary info
 */
async function getCurrentUser(req, res) {
	const currentUser = await userModel.findOne({ _id: req.user._id }).populate({
		path: 'days',
		model: dayModel,
		select: '-__v',
		populate: [{ path: 'daySummary', model: summaryModel, select: '-__v -_id -userId' }],
	});

	const { username, email, _id, userData, days } = currentUser;
	const currentDate = new Date().toLocaleDateString('us-US');

	const existingDay = days.find(({ date }) => date === currentDate);

	if (!existingDay) {
		return res.status(200).json({
			user: { userId: _id, username, email, userData },
			daySummary: {
				eatenProducts: [],
				date: currentDate,
				kcalLeft: userData.dailyRate,
				kcalConsumed: 0,
				dailyRate: userData.dailyRate,
				percentsOfDailyRate: 0,
			},
		});
	}

	const response = {
		user: { userId: _id, username, email, userData },
		daySummary: {
			dayId: existingDay._id,
			eatenProducts: existingDay.eatenProducts,
			date: existingDay.daySummary.date,
			kcalLeft: existingDay.daySummary.kcalLeft,
			kcalConsumed: existingDay.daySummary.kcalConsumed,
			dailyRate: existingDay.daySummary.dailyRate,
			percentsOfDailyRate: existingDay.daySummary.percentsOfDailyRate,
		},
	};

	return res.status(200).json(response);
}

module.exports = { getCurrentUser };
