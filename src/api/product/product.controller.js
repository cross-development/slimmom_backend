//Model
const productModel = require('./product.model');

/**
 * This controller finds products by query string.
 * Checks them to be allowed for the user.
 * If there are any, it returns them.
 * If not, it returns the message: 'No allowed products found for this query'
 */
async function findProducts(req, res) {
	const {
		query: { search },
		user: { userData },
	} = req;

	const foundProducts = await productModel
		.find({
			'title.ru': { $regex: search, $options: 'i' },
		})
		.lean();

	const allowedProducts = foundProducts.filter(
		({ groupBloodNotAllowed }) => groupBloodNotAllowed[userData.bloodType] === false,
	);

	if (!allowedProducts.length) {
		return res.status(400).json({ message: 'No allowed products found for this query' });
	}

	return res.status(200).json(allowedProducts);
}

module.exports = { findProducts };
