const ora = require('ora');

const Questions = require('./questions');
const Github = require('./github');
const Log = require('./log');

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
				emailsWithUser.push({ name: info.name, email: info.email });
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

const main = async (args) => {
	const { repoQuery: query } = await Questions.getSearchPrompt();

	const spinner = ora('Searching the repos...').start();
	const repos = await Github.search({ query });
	spinner.stop();

	if (repos.length === 0) {
		const { searchAgain } = await Questions.repoDoesNotExistPrompt();

		if (searchAgain === true) {
			await main(args);
		}
		return process.exit(0);
	}

	const { repo } = await Questions.getSelectRepoPrompt(repos);
	spinner.start('Getting the list of contributors...');

	const usernames = await Github.getContributorUserNames(repo);
	spinner.succeed();
	spinner.start('Getting the list of users email addresses...');

	const emailsWithUser = await getEmailOfFirstTenCollaborators({ usernames });

	spinner.succeed();
	console.table(emailsWithUser);
	return process.exit(0);
};

module.exports = { main };
