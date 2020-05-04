const parse = require('minimist');
const Log = require('./log');

const parseArgs = (args) =>
	parse(args, {
		alias: { h: 'help', s: 'secret' },
		boolean: ['h'],
		string: ['secret'],
	});

const help = () =>
	console.log(Log.text`
A simple cli tool for getting the email address of the top 10 contributors in the repo.
Usage
	--secret, -s : Pass github authentication token to increase the github api call limit. For more info check https://developer.github.com/v3/rate_limit/
	--help, -h : For info
		`);

module.exports = { help, parseArgs };
