const ora = require('ora');
const Table = require('cli-table');

const Questions = require('./questions');
const Github = require('./github');
const Log = require('./log');
const Util = require('./utils');

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
				emailsWithUser.push(user);
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

const printInfo = ({ emailsWithUser }) => {
	const table = new Table({
		head: ['User Name', 'Full Name', 'Github Link', 'Email'],
	});

	table.push(
		emailsWithUser.map((user) => [user.login, user.name, user.url, user.email])
	);

	console.log(table.toString());
};

const main = async (args) => {
	const { repoQuery: query } = await Questions.getSearchPrompt();

	const spinner = ora('Searching the repos...').start();
	const repos = await Util.exitPromise(
		Github.search({ query }),
		'repositories'
	);
	spinner.stop();

	if (repos.length === 0) {
		const { searchAgain } = await Questions.repoDoesNotExistPrompt();

		if (searchAgain === true) {
			await main(args);
		}
		process.exit(0);
	}

	const { repo } = await Questions.getSelectRepoPrompt(repos);

	spinner.start('Getting the list of contributors...');
	const usernames = await Util.exitPromise(
		Github.getContributorUserNames(repo),
		'contributors'
	);
	spinner.succeed();

	spinner.start('Getting the list of users email addresses...');
	const emailsWithUser = await getEmailOfFirstTenCollaborators({ usernames });
	spinner.succeed();

	printInfo({ emailsWithUser });
	return process.exit(0);
};

module.exports = { main };
