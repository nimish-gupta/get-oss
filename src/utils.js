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

const spinnerPromise = (msg, spinnerOptions = {}) => async (promise) => {
	const spinner = ora({ text, ...spinnerOptions }).start();
	const result = await promise;
	spinner.stop();
	return result;
};

const compose = (...functions) => (input) =>
	functions.reduceRight(
		(chain, func) => chain.then(func),
		Promise.resolve(input)
	);

const pipe = (...functions) => (input) =>
	functions.reduce((chain, func) => chain.then(func), Promise.resolve(input));

module.exports = { promisify, exitPromise, spinnerPromise, compose, pipe };
