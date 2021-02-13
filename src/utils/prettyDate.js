function getCurrentDate() {
	const date = new Date();

	const today = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

	return today;
}

module.exports = getCurrentDate;
