const { Octokit } = require('@octokit/rest');
const validator = require('validator');

const octokit = new Octokit({
	userAgent: 'get-oss v1.2.3',
});

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

const getEmail = async (username) => {
	const { data: user } = await octokit.users.getByUsername({ username });

	if (user.email !== null) {
		return user.email;
	}

	const {
		data: events,
	} = await octokit.activity.listEventsForAuthenticatedUser({
		username,
	});
	console.log(user.name);

	const author = events
		.filter((event) => event.payload && event.payload.commits)
		.map((event) => event.payload.commits)
		.find(
			(commit) =>
				commit.author && commit.author.name && commit.author.name === user.name
		);

	if (author !== undefined) {
		return author.email;
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
		.find(
			(commit) =>
				commit.author &&
				commit.author.name === user.name &&
				validator.isEmail(commit.author.email)
		);

	return commitAuthor === undefined ? null : commitAuthor.author.email;
};

module.exports = {
	search,
	getContributorUserNames,
	getEmail,
};
