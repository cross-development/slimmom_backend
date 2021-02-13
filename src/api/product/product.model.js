const { Schema, model } = require('mongoose');

const productSchema = new Schema({
	categories: Array,
	weight: Number,
	title: { ru: String, ua: String },
	calories: Number,
	groupBloodNotAllowed: {
		0: {},
		1: Boolean,
		2: Boolean,
		3: Boolean,
		4: Boolean,
	},
});

module.exports = model('Product', productSchema);
