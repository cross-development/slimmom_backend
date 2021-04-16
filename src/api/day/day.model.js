//Core
const {
	model,
	Schema,
	Types: { ObjectId },
} = require('mongoose');

const daySchema = new Schema({
	date: String,
	daySummary: { type: ObjectId, ref: 'Summary' },
	eatenProducts: [{ _id: false, title: String, weight: Number, kcal: Number, id: String }],
});

module.exports = model('Day', daySchema);
