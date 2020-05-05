const ora = require('ora');

const Log = require('./log');

const promisify = async (promise) => {
	try {
		const result = await promise;
		return [result, null];
	} catch (error) {
		return [null, error.message];
	}
};

const exitPromise = async (promise, msg, onError = () => process.exit(1)) => {
	const [result, error] = await promisify(promise);

	if (error !== null) {
		const errorMessage = `Could not query repo for ${msg} due to, ${error}`;
		console.log('\n');
		console.log(Log.error(errorMessage));
		return onError(errorMessage);
	}

	return result;
};

const spinnerPromise = async (promise, text, spinnerOptions = {}) => {
	const spinner = ora({ text, ...spinnerOptions }).start();
	const result = await promise;
	spinner.stop();
	return result;
};

module.exports = { promisify, exitPromise, spinnerPromise };
