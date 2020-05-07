const test = require('ava');
const sinon = require('sinon');

const Github = require('../github');
const Fixture = require('./fixtures');
const Common = require('./utils/common');

let listEventsStub;
let userNameStub;

test.before(() => {
	const octokit = Github.setAuth();
	const githubStub = Common.githubSinon(octokit);
	listEventsStub = githubStub.listEventsStub;
	userNameStub = githubStub.userNameStub;
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

test.serial('getUserInfo user already has email in github', async (t) => {
	const actual = await Github.getUserInfo('nimish-gupta');
	t.deepEqual(actual, Fixture.user().data);
});

test.serial('getUserInfo email present in the latest commits', async (t) => {
	userNameStub.resolves(Fixture.user(true));
	const actual = await Github.getUserInfo('nimish-gupta');
	t.deepEqual(actual, Fixture.user().data);
});

test.serial(
	'getUserInfo email present in the owned repos commit',
	async (t) => {
		listEventsStub.resolves(Fixture.events(true));
		const actual = await Github.getUserInfo('nimish-gupta');
		t.deepEqual(actual, Fixture.user().data);
	}
);
