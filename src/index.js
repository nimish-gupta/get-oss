const ora = require('ora');

const Questions = require('./questions');
const Github = require('./github');
const Log = require('./log');
const Util = require('./utils');
const Args = require('./args');
const Table = require('./table');

const getEmailOfFirstTenCollaborators = async ({ usernames }) => {
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
			userSpinner.fail(
				Log.error(`Could not fetch email for ${user} due to ${error.message}`)
			);
		}
	}
	return emailsWithUser;
};

const main = async (args, onExit = () => process.exit(0)) => {
	const parsedArgs = Args.parseArgs(args);

	if (parsedArgs.help) {
		const help = Args.help();
		return onExit(help);
	}

	Github.setAuth(parsedArgs.secret);

	const { repoQuery: query } = await Questions.getSearchPrompt();

	const repos = await Util.spinnerPromise(
		Util.exitPromise(Github.search({ query }), 'repositories'),
		'Searching the repos...'
	);

	if (repos.length === 0) {
		const { searchAgain } = await Questions.repoDoesNotExistPrompt();

		if (searchAgain === true) {
			// await main(args);
		}
		return onExit(searchAgain);
	}

	const { repo } = await Questions.getSelectRepoPrompt(repos);

	const usernames = await Util.spinnerPromise(
		Util.exitPromise(Github.getContributorUserNames(repo), 'contributors'),
		'Getting the list of contributors...'
	);

	const emailsWithUser = await Util.spinnerPromise(
		getEmailOfFirstTenCollaborators({ usernames }),
		'Getting the list of users email addresses...'
	);

	Table.formatter({ emailsWithUser });
	return onExit(emailsWithUser);
};

module.exports = { main, getEmailOfFirstTenCollaborators };
