const chalk = require('chalk');

const error = chalk.bold.red;
const success = chalk.italic.green;
const text = chalk.cyan;
const url = chalk.underline.blue;

const log = (value) => {
	console.log(value);
	return value;
};

module.exports = { error, success, text, url, log };
