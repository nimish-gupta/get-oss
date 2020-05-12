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

const showHelp = () => {
	Args.help();
	process.exit(0);
};

const getMayBeToken = (args) =>
	args.help ? F.Either.Left() : F.Either.Right(args.secret);

const parseArgs = R.compose(
	F.Either.either(showHelp, Github.setAuth),
	getMayBeToken,
	Args.parseArgs
);

const whenRepoDoesNotExist = R.compose(
	R.map(F.Either.Left),
	R.map(R.prop('searchAgain')),
	Questions.repoDoesNotExistPrompt
);

const getContributorsName = R.compose(
	R.map(Util.spinnerPromise('Getting the list of contributors...')),
	R.map(Util.exitPromise('repositories')),
	R.map(Github.getContributorUserNames)
);

const whenRepoExist = R.compose(
	R.map(F.Either.Right),
	R.map(Table.formatter),
	R.chain(Util.futurePromise),
	R.map(Util.spinnerPromise('Getting the list of users email addresses...')),
	R.map(getEmailOfFirstTenCollaborators),
	R.chain(Util.futurePromise),
	getContributorsName,
	R.map(R.prop('repo')),
	Questions.getSelectRepoPrompt
);

const getSearchResults = R.compose(
	R.map(Util.spinnerPromise('Searching the repos...')),
	R.map(Util.exitPromise('repositories')),
	R.map(Github.search)
);

const isRepoExist = (repos) =>
	repos.length === 0 ? F.Either.Left('') : F.Either.Right(repos);

const doAgainSearchRepo = (ans) =>
	ans ? F.Future.of(getRepoName()) : F.Future.of(R.identity);

const repoQuery = R.compose(
	R.chain(F.Either.either(doAgainSearchRepo, () => F.Future.of(R.identity))),
	R.chain(F.Either.either(whenRepoDoesNotExist, whenRepoExist)),
	R.map(isRepoExist),
	R.chain(Util.futurePromise),
	getSearchResults,
	R.map(R.prop('repoQuery')),
	Questions.getSearchPrompt
);

const getRepoName = () => repoQuery().fork(console.error, R.identity);

const main = R.compose(getRepoName, parseArgs);

module.exports = { main };
