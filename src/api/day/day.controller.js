//Core
const crypto = require('crypto');
//Models
const dayModel = require('./day.model');
const userModel = require('../user/user.model');
const productModel = require('../product/product.model');
const summaryModel = require('../summary/summary.model');

async function addProduct(req, res) {
	const {
		body: { date, productId, weight },
		user: { _id: userId, userData },
	} = req;

	const product = await productModel.findById(productId);

	if (!product) {
		return res.status(404).json({ message: 'Product not found' });
	}

	const user = await userModel.findById(userId).populate('days');

	const existingDay = user.days.find(day => day.date === date);

	const kcalCoefficient = product.calories / product.weight;
	const kcalConsumed = kcalCoefficient * weight;

	const eatenProduct = {
		id: await crypto.randomBytes(16).toString('hex'),
		title: product.title.ru,
		kcal: kcalConsumed,
		weight,
	};

	if (existingDay) {
		existingDay.eatenProducts.push(eatenProduct);
		await existingDay.save();

		const daySummary = await summaryModel.findOne({ $and: [{ date }, { userId }] });

		daySummary.kcalLeft -= kcalConsumed;
		daySummary.kcalConsumed += kcalConsumed;
		daySummary.percentsOfDailyRate = (daySummary.kcalConsumed * 100) / userData.dailyRate;

		if (daySummary.kcalLeft < 0) {
			daySummary.kcalLeft = 0;
			daySummary.percentsOfDailyRate = 100;
		}

		await daySummary.save();

		return res.status(201).send({
			eatenProduct,
			daySummary: {
				id: daySummary._id,
				date: daySummary.date,
				userId: daySummary.userId,
				kcalLeft: daySummary.kcalLeft,
				dailyRate: daySummary.dailyRate,
				kcalConsumed: daySummary.kcalConsumed,
				percentsOfDailyRate: daySummary.percentsOfDailyRate,
			},
			day: {
				id: existingDay._id,
				date: existingDay.date,
				daySummary: existingDay.daySummary,
				eatenProducts: existingDay.eatenProducts,
			},
		});
	}

	const newSummary = await summaryModel.create({
		userId,
		date,
		kcalConsumed,
		dailyRate: userData.dailyRate,
		kcalLeft: userData.dailyRate - kcalConsumed,
		percentsOfDailyRate: (kcalConsumed * 100) / userData.dailyRate,
	});

	if (newSummary.kcalLeft < 0) {
		newSummary.kcalLeft = 0;
		newSummary.percentsOfDailyRate = 100;
		await newSummary.save();
	}

	const newDay = await dayModel.create({
		eatenProducts: [eatenProduct],
		daySummary: newSummary._id,
		date,
	});

	user.days.push(newDay._id);
	await user.save();

	return res.status(201).send({
		eatenProduct,
		newDay: {
			id: newDay._id,
			date: newDay.date,
			daySummary: newDay.daySummary,
			eatenProducts: newDay.eatenProducts,
		},
		newSummary: {
			id: newSummary._id,
			date: newSummary.date,
			userId: newSummary.userId,
			kcalLeft: newSummary.kcalLeft,
			dailyRate: newSummary.dailyRate,
			kcalConsumed: newSummary.kcalConsumed,
			percentsOfDailyRate: newSummary.percentsOfDailyRate,
		},
	});
}

async function deleteProduct(req, res) {
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
}

async function getDayInfo(req, res) {
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
}

//The middleware checks selected daily rate
async function checkDailyRate(req, res, next) {
	const { userData } = req.user;

	if (!userData.dailyRate) {
		return res.status(403).json({ message: 'Please, count your daily rate first' });
	}

	next();
}

module.exports = { addProduct, deleteProduct, getDayInfo, checkDailyRate };
