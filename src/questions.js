const inquirer = require('inquirer');

/* istanbul ignore next */
const getSearchPrompt = async () =>
	inquirer.prompt([
		{
			type: 'input',
			name: 'repoQuery',
			message: 'Enter the repo to be searched:',
			validate: (val) =>
				val.length !== 0 ? true : `Searched repo couldn't be empty.`,
		},
	]);

/* istanbul ignore next */
const getSelectRepoPrompt = async (repos) =>
	inquirer.prompt({
		type: 'list',
		name: 'repo',
		message:
			'Please select the repo of which you want to have maintainers list:',
		choices: repos.map((repo) => ({
			name: repo.full_name,
			value: repo,
		})),
		validate: (val) => (val.length !== 0 ? true : `Please select a repo.`),
		pageSize: 10,
	});

/* istanbul ignore next */
const repoDoesNotExistPrompt = async () =>
	inquirer.prompt({
		type: 'confirm',
		name: 'searchAgain',
		message: `Repo doesn't exist. Do you want to search again?`,
	});

const getAnswer = (key) => (answer) => answer[key];

module.exports = {
	getAnswer,
	getSearchPrompt,
	getSelectRepoPrompt,
	repoDoesNotExistPrompt,
};
