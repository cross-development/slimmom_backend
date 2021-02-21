//Core
const {
	Schema,
	model,
	Types: { ObjectId },
} = require('mongoose');

const summarySchema = new Schema({
	date: String,
	kcalLeft: Number,
	kcalConsumed: Number,
	percentsOfDailyRate: Number,
	dailyRate: Number,
	userId: ObjectId,
});

module.exports = model('Summary', summarySchema);
