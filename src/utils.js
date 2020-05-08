const R = require('ramda');
const ora = require('ora');
const F = require('ramda-fantasy');

const Log = require('./log');

const futurePromise = (promise) =>
	F.Future((reject, resolve) => promise.then(resolve).catch(reject));

const promisify = async (promise) => {
	try {
		const result = await promise;
		return [result, null];
	} catch (error) {
		return [null, error.message];
	}
};

const exitPromise = (msg) => async (promise) => {
	const [result, error] = await promisify(promise);

	if (error !== null) {
		const errorMessage = `Could not query repo for ${msg} due to, ${error}`;
		console.log('\n');
		console.log(Log.error(errorMessage));
		return onError(errorMessage);
	}

	return result;
};

const spinnerPromise = (text, spinnerOptions = {}) => async (promise) => {
	const spinner = ora({ text, ...spinnerOptions }).start();
	const result = await promise;
	spinner.stop();
	return result;
};

module.exports = {
	promisify,
	exitPromise,
	spinnerPromise,
	futurePromise,
};
