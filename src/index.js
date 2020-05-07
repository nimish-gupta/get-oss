const ora = require('ora');
const R = require('ramda');
const F = require('ramda-fantasy');

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

// R.chain(Util.futurePromise),
// R.map(Util.spinnerPromise('Getting the list of contributors...')),
// R.map(Util.exitPromise('contributors')),
// R.map(Github.getContributorUserNames),
// R.chain(Util.futurePromise),
// R.map(Util.spinnerPromise('Getting the list of users email addresses...')),
// R.map(getEmailOfFirstTenCollaborators),

const isRepoExists = (repos) =>
	repos.length === 0 ? F.Either.Left('') : F.Either.Right(repos);

const repoQuery = R.compose(
	// R.map(R.prop('repo')),
	R.chain(Util.futurePromise),
	R.map(Util.spinnerPromise('Searching the repos...')),
	R.map(Util.exitPromise('repositories')),
	R.map(Github.search),
	R.map(R.prop('repoQuery')),
	Questions.getSearchPrompt
);

const getRepoName = () =>
	repoQuery().fork(
		(err) => console.log('err', err),
		(data) => console.log('data', data.fork())
	);

// const getEmailsWithUser = Util.pipeAsync(
// 	R.compose(
// 		Util.spinnerPromise('Getting the list of contributors...'),
// 		Util.exitPromise('contributors'),
// 		Github.getContributorUserNames
// 	),
// 	R.compose(
// 		Util.spinnerPromise('Getting the list of users email addresses...'),
// 		getEmailOfFirstTenCollaborators
// 	)
// );

const main = R.compose(
	// Util.then(Table.formatter),
	getRepoName,
	parseArgs
);

module.exports = { main };
