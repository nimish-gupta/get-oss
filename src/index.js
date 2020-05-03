const Questions = require('./questions');
const Github = require('./github');

const main = async (args) => {
	const { repoQuery: query } = await Questions.getSearchPrompt();
	const repos = await Github.search({ query });

	if (repos.length === 0) {
		const { searchAgain } = await Questions.repoDoesNotExistPrompt();

		if (searchAgain === true) {
			await main(args);
		}
		return process.exit(0);
	}

	const { repo } = await Questions.getSelectRepoPrompt(repos);
	const usernames = await Github.getContributorUserNames(repo);
	await Github.getEmail(usernames[0]);
	return process.exit(0);
};

module.exports = { main };
