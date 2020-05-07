const test = require('ava');
const sinon = require('sinon');

const Github = require('../github');
const Fixture = require('./fixtures');

const repoStub = sinon.stub();
const contributorsStub = sinon.stub();
const listEventsStub = sinon.stub();
const userNameStub = sinon.stub();

test.before(() => {
	const octokit = Github.setAuth();

	sinon.replace(octokit.search, 'repos', repoStub);
	sinon.replace(octokit.users, 'getByUsername', userNameStub);
	sinon.replace(octokit.repos, 'listContributors', contributorsStub);
	sinon.replace(
		octokit.activity,
		'listEventsForAuthenticatedUser',
		listEventsStub
	);

	repoStub.resolves(Fixture.repos);
	contributorsStub.resolves(Fixture.contributors);
	listEventsStub.resolves(Fixture.events);
	userNameStub.resolves(Fixture.user);

	// sinon.replace(octokit.users, 'getByUsername', getByUsernameFake);
	// sinon.replace(
	// 	octokit.activity,
	// 	'listEventsForAuthenticatedUser',
	// 	listEventsForAuthenticatedUserFake
	// );
	// t.context.octokit = octokit;
});

test.after(() => sinon.restore());

test('github search', async (t) => {
	const actual = await Github.search({ query: 'nimish' });
	t.deepEqual(actual, [
		{
			full_name: 'nimish-gupta/get-oss',
			repo: 'get-oss',
			owner: 'nimish-gupta',
		},
	]);
});

test('getContributorUserNames', async (t) => {
	const actual = await Github.getContributorUserNames({
		owner: 'nimish-gupta',
		repo: 'nimish-gupta/get-oss',
	});
	t.deepEqual(actual, ['nimish-gupta']);
});

test('getUserInfo user already has email in github', async (t) => {
	const actual = await Github.getUserInfo('nimish-gupta');
	t.deepEqual(actual, Fixture.user.data);
});

test('getUserInfo email present in the latest commits', async (t) => {
	userNameStub.resolves(Fixture.noEmailUser);
	const actual = await Github.getUserInfo('nimish-gupta');
	console.log(actual);
});
