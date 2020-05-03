const inquirer = require('inquirer');

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

const repoDoesNotExistPrompt = async () =>
	inquirer.prompt({
		type: 'confirm',
		name: 'searchAgain',
		message: `Repo doesn't exist. Do you want to search again?`,
	});

module.exports = {
	getSearchPrompt,
	getSelectRepoPrompt,
	repoDoesNotExistPrompt,
};