const tryCatchHandler = callback => (req, res, next) => {
	return callback(req, res, next).catch(error => next(error));
};

module.exports = tryCatchHandler;
