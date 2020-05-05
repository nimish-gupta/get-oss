const ora = require('ora');
const R = require('ramda');

const Questions = require('./questions');
const Github = require('./github');
const Log = require('./log');
const Util = require('./utils');
const Args = require('./args');
const Table = require('./table');

const getEmailOfFirstTenCollaborators = async (usernames) => {
	let count = 0,
		emailsWithUser = [];
	const userSpinner = ora();

	for (let user of usernames) {
		if (count > 10) {
			break;
		}

		userSpinner.start(`Getting email for user ${user}... `);
		try {
			const info = await Github.getUserInfo(user);

			if (info !== null && info.email !== null) {
				emailsWithUser.push(info);
				userSpinner.succeed(
					Log.success(`${user}'s email exist in github as ${info.email}`)
				);
				count++;
			} else {
				userSpinner.fail(Log.error(`${user}'s email doesn't exist in github`));
			}
		} catch (error) {
			console.log(error);
			userSpinner.fail(
				Log.error(`Could not fetch email for ${user} due to ${error.message}`)
			);
		}
	}
	return emailsWithUser;
};

const parseArgs = (args) => {
	const parsedArgs = Args.parseArgs(args);

	if (parsedArgs.help) {
		const help = Args.help();
		return onExit(help);
	}

	Github.setAuth(parsedArgs.secret);
};

const repoQuery = R.pipe(
	Questions.getSearchPrompt,
	Util.then(
		R.pipe(
			R.prop('repoQuery'),
			Github.search,
			Util.exitPromise('repositories'),
			Util.spinnerPromise('Searching the repos...')
		)
	)
);

const getRepoName = async () => {
	const repos = await repoQuery();
	if (repos.length === 0) {
		const { searchAgain } = await Questions.repoDoesNotExistPrompt();
		if (searchAgain === true) {
			return getRepoName();
		}

		process.exit(0);
	}
	return R.pipe(
		getEmailOfFirstTenCollaborators,
		Util.spinnerPromise('Getting the list of users email addresses...')
	)();
};

const getEmailsWithUser = Util.pipeAsync(
	Util.pipe(
		Github.getContributorUserNames,
		Util.exitPromise('contributors'),
		Util.spinnerPromise('Getting the list of contributors...')
	),
	Util.pipe(
		getEmailOfFirstTenCollaborators,
		Util.spinnerPromise('Getting the list of users email addresses...')
	)
);

const main = R.pipe(
	parseArgs,
	getRepoName,
	Util.then(getEmailsWithUser),
	Util.then(Table.formatter)
);

module.exports = { main };
