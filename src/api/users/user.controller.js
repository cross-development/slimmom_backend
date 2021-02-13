//Gets user credential from request and returns the current user
async function getCurrentUser(req, res, next) {
	try {
		const { username, email, _id } = req.user;

		return res.status(200).json({ userId: _id, username, email });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getCurrentUser,
};
