//Core
const {
	Schema,
	model,
	Types: { ObjectId },
} = require('mongoose');

const userSchema = new Schema(
	{
		username: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		token: { type: String, required: false },
		userData: {
			weight: Number,
			height: Number,
			age: Number,
			bloodType: Number,
			desiredWeight: Number,
			dailyRate: Number,
			notAllowedProducts: [String],
		},
		days: [{ type: ObjectId, ref: 'Day' }],
	},
	{ minimize: false },
);

module.exports = model('User', userSchema);
