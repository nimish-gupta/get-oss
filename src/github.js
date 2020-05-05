const { Octokit } = require('@octokit/rest');
const validator = require('validator');

let octokit = null;

const setAuth = (token) => {
	octokit = new Octokit({
		userAgent: 'get-oss v1.2.3',
		...(token ? { auth: token } : {}),
	});
};

const search = async ({ query: q, page = 1 }) => {
	const {
		data: { items },
	} = await octokit.search.repos({
		q,
		sort: 'stars',
		order: 'desc',
		per_page: 10,
		page,
	});
	return items.map(({ full_name, name: repo, owner: { login: owner } }) => ({
		full_name,
		repo,
		owner,
	}));
};

const getContributorUserNames = async ({ owner, repo }) => {
	const { data: items } = await octokit.repos.listContributors({
		owner,
		repo,
	});
	return items.map((item) => item.login);
};

const checkValidEmailFromCommit = (name) => (commit) =>
	commit.author &&
	commit.author.name === name &&
	validator.isEmail(commit.author.email);

const getUserInfo = async (username) => {
	const { data: user } = await octokit.users.getByUsername({ username });
	if (user.email !== null) {
		return user;
	}

	const {
		data: events,
	} = await octokit.activity.listEventsForAuthenticatedUser({
		username,
	});

	const eventAuthor = events
		.filter((event) => event.payload && event.payload.commits)
		.map((event) => event.payload.commits)
		.flat()
		.find(checkValidEmailFromCommit(user.name));

	if (eventAuthor !== undefined) {
		return { ...user, email: eventAuthor.author.email };
	}

	const {
		data: [repo],
	} = await octokit.repos.listForUser({
		username,
		type: 'owner',
		sort: 'updated',
		direction: 'desc',
	});

	if (repo === undefined) {
		return null;
	}

	const { data: commits } = await octokit.repos.listCommits({
		repo: repo.name,
		owner: username,
	});

	const commitAuthor = commits
		.map((commit) => commit.commit)
		.find(checkValidEmailFromCommit(user.name));

	return commitAuthor === undefined
		? null
		: {
				...user,
				email: commitAuthor.author.email,
		  };
};

module.exports = {
	search,
	getContributorUserNames,
	getUserInfo,
	setAuth,
};
