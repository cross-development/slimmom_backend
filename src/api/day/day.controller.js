//Core
const crypto = require('crypto');
//Models
const dayModel = require('./day.model');
const userModel = require('../user/user.model');
const productModel = require('../product/product.model');
const summaryModel = require('../summary/summary.model');

async function addProduct(req, res, next) {
    try {
        
    } catch (error) {
        next(error)
    }
}

async function deleteProduct(req, res, next) {
	try {
		const {
			body: { dayId, eatenProductId },
			user: { days, userData },
		} = req;

		const isDayExisting = days.find(day => day.toString() === dayId);

		if (!isDayExisting) {
			return res.status(404).json({ message: 'Day not found' });
		}

		const selectedDay = await dayModel.findById(dayId);
		const product = selectedDay.eatenProducts.find(product => product.id === eatenProductId);

		if (!product) {
			return res.status(404).send({ message: 'Product not found' });
		}

		await dayModel.findByIdAndUpdate(dayId, { $pull: { eatenProducts: { id: eatenProductId } } });

		const daySummary = await summaryModel.findById(selectedDay.daySummary);

		daySummary.kcalLeft += product.kcal;
		daySummary.kcalConsumed -= product.kcal;
		daySummary.percentsOfDailyRate = (daySummary.kcalConsumed * 100) / userData.dailyRate;

		await daySummary.save();

		const { date, kcalLeft, kcalConsumed, dailyRate, percentsOfDailyRate, userId, id } = daySummary;
		const response = { date, kcalLeft, kcalConsumed, dailyRate, percentsOfDailyRate, userId, id };

		return res.status(200).json({ updatedDaySummary: { ...response } });
	} catch (error) {
		next(error);
	}
}

async function getDayInfo(req, res, next) {
	try {
		const user = await userModel.findById(req.user._id).populate('days');

		const dayInfo = user.days.find(day => day.date === req.body.date);

		if (!dayInfo) {
			return res.status(200).json({
				kcalLeft: req.user.userData.dailyRate,
				kcalConsumed: 0,
				dailyRate: req.user.userData.dailyRate,
				percentsOfDailyRate: 0,
			});
		}

		const selectedDay = await dayModel.findById(dayInfo._id).populate('daySummary');
		const { _id, eatenProducts, date, daySummary } = selectedDay;

		return res.status(200).json({
			id: _id,
			eatenProducts,
			date,
			daySummary: {
				date: daySummary.date,
				kcalLeft: daySummary.kcalLeft,
				kcalConsumed: daySummary.kcalConsumed,
				dailyRate: daySummary.dailyRate,
				percentsOfDailyRate: daySummary.percentsOfDailyRate,
				userId: daySummary.userId,
				id: daySummary._id,
			},
		});
	} catch (error) {
		next(error);
	}
}

module.exports = { addProduct, deleteProduct, getDayInfo };
