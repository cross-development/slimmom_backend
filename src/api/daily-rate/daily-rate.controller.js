//Models
const userModel = require('../user/user.model');
const summaryModel = require('../summary/summary.model');
const productModel = require('../product/product.model');

/**
 * This controller calculate daily rate by received credentials.
 * If the userId was not passed, then it returns the calculated
 * daily rate and the list of non-recommended products.
 * If the userId was passed, then it updates userData in the
 * database and returns updated information about the daily rate
 */
async function calculateDailyRate(req, res, next) {
	try {
		const {
			body: { height, weight, age, desiredWeight, bloodType },
			params: { userId },
		} = req;

		const dailyRate = 10 * weight + 6.25 * height - 5 * age - 161 - 10 * (weight - desiredWeight);

		const notAllowedProductsData = await productModel.find({
			[`groupBloodNotAllowed.${bloodType}`]: true,
		});

		const notAllowedProducts = notAllowedProductsData.map(({ title }) => title.ru);

		if (!userId) {
			return res.status(200).json({ dailyRate, notAllowedProducts });
		}

		const user = await userModel.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'Invalid user' });
		}

		await userModel.findByIdAndUpdate(
			userId,
			{
				userData: { height, weight, age, desiredWeight, bloodType, dailyRate, notAllowedProducts },
			},
			{ new: true },
		);

		let summaries = await summaryModel.find({ userId });

		if (summaries) {
			summaries.forEach(summary => {
				if (summary.dailyRate > dailyRate) {
					const diff = summary.dailyRate - dailyRate;

					summary.dailyRate = dailyRate;
					summary.kcalLeft -= diff;
					summary.percentsOfDailyRate = (summary.kcalConsumed * 100) / dailyRate;
					summary.save();
				}

				if (summary.dailyRate < dailyRate) {
					const diff = dailyRate - summary.dailyRate;

					summary.dailyRate = dailyRate;
					summary.kcalLeft += diff;
					summary.percentsOfDailyRate = (summary.kcalConsumed * 100) / dailyRate;
					summary.save();
				}
			});
		} else {
			summaries = [];
		}

		return res.status(201).json({ userId: user._id, dailyRate, summaries, notAllowedProducts });
	} catch (error) {
		next(error);
	}
}

module.exports = { calculateDailyRate };
