const ora = require('ora');

const Questions = require('./questions');
const Github = require('./github');

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

	await Github.getUserInfo(usernames[0]);
	spinner.succeed();
	console.table([
		{ a: 1, b: 'Y' },
		{ a: 'Z', b: 2 },
	]);
	return process.exit(0);
};

module.exports = { main };
