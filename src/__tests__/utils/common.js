const sinon = require('sinon');

const Fixture = require('../fixtures');

const githubSinon = (octokit) => {
	const repoStub = sinon.stub();
	const contributorsStub = sinon.stub();
	const listEventsStub = sinon.stub();
	const userNameStub = sinon.stub();
	const ownedRepos = sinon.stub();
	const commitStub = sinon.stub();

	sinon.replace(octokit.search, 'repos', repoStub);
	sinon.replace(octokit.users, 'getByUsername', userNameStub);
	sinon.replace(octokit.repos, 'listContributors', contributorsStub);
	sinon.replace(octokit.repos, 'listForUser', ownedRepos);
	sinon.replace(octokit.repos, 'listCommits', commitStub);
	sinon.replace(
		octokit.activity,
		'listEventsForAuthenticatedUser',
		listEventsStub
	);

	repoStub.resolves(Fixture.repos());
	contributorsStub.resolves(Fixture.contributors);
	listEventsStub.resolves(Fixture.events());
	userNameStub.resolves(Fixture.user());
	ownedRepos.resolves(Fixture.ownedRepos);
	commitStub.resolves(Fixture.commits());

	return {
		octokit,
		repoStub,
		contributorsStub,
		listEventsStub,
		userNameStub,
		ownedRepos,
		commitStub,
	};
};

module.exports = { githubSinon };
