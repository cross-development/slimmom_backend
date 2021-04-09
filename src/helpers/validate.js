const validate = (schema, reqPart = 'body') => (req, res, next) => {
	const validationResult = schema.validate(req[reqPart]);

	if (validationResult.error) {
		const message = validationResult.error.details[0].message;

		return res.status(400).json({ message });
	}

	next();
};

module.exports = validate;
