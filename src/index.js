const ora = require('ora');

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

const getRepoName = async () => {
	const repos = await Util.pipeAsync(
		Questions.getSearchPrompt,
		Questions.getAnswer('repoQuery'),
		Util.pipe(
			Github.search,
			Util.exitPromise('repositories'),
			Util.spinnerPromise('Searching the repos...')
		)
	)();

	if (repos.length === 0) {
		const { searchAgain } = await Questions.repoDoesNotExistPrompt();

		if (searchAgain === true) {
			await getRepoName();
		}
		return onExit(searchAgain);
	}

	const { repo } = await Questions.getSelectRepoPrompt(repos);
	return repo;
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

const main = Util.pipeAsync(
	parseArgs,
	getRepoName,
	getEmailsWithUser,
	Table.formatter
);

module.exports = { main };
