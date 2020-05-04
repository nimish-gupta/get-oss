const chalk = require('chalk');

const error = chalk.bold.red;
const success = chalk.italic.green;
const text = chalk.cyan;
const url = chalk.underline.blue;

module.exports = { error, success, text, url };
