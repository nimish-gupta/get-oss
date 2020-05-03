const Log = require('./log');

const promisify = async (promise) => {
	try {
		const result = await promise;
		return [result, null];
	} catch (error) {
		return [null, error];
	}
};

const exitPromise = async (promise, msg) => {
	const [result, error] = await promisify(promise);

	if (error !== null) {
		console.log('\n');
		console.log(
			Log.error(`Could not query repo for ${msg} due to, ${error.message}`)
		);
		process.exit(1);
	}

	return result;
};

module.exports = { promisify, exitPromise };
