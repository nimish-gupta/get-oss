const test = require('ava');
const sinon = require('sinon');

const Index = require('../index');
const Github = require('../github');
const Table = require('../table');
const Question = require('../questions');
const Fixture = require('./fixtures');
const Common = require('./utils/common');

const onExit = (text) => text;
const setAuth = sinon.stub();
const searchPrompt = sinon.stub();
const selectPrompt = sinon.stub();
const confirmPrompt = sinon.stub();
const formatter = sinon.spy(Table, 'formatter');

test.before(async (t) => {
	t.context.octokit = Github.setAuth();
	sinon.replace(Github, 'setAuth', setAuth);
	setAuth.returns(t.context.octokit);

	const githubStub = Common.githubSinon(t.context.octokit);
	t.context.repoStub = githubStub.repoStub;

	sinon.replace(Question, 'getSearchPrompt', searchPrompt);
	sinon.replace(Question, 'getSelectRepoPrompt', selectPrompt);
	sinon.replace(Question, 'repoDoesNotExistPrompt', confirmPrompt);

	selectPrompt.resolves(Fixture.selectPrompt);
	searchPrompt.resolves(Fixture.searchPrompt);
	confirmPrompt.resolves(Fixture.confirmPrompt(false));
});

test.after(() => sinon.restore());

test('when help argument is send', async (t) => {
	const actual = await Index.main(['-h'], onExit);
	const expected = `
A simple cli tool for getting the email address of the top 10 contributors in the repo.
Usage
	--secret, -s : Pass github authentication token to increase the github api call limit. For more info check https://developer.github.com/v3/rate_limit/
	--help, -h : For info`;
	t.is(actual, expected);
});

test('correct token passed from cli', async (t) => {
	await Index.main(['--secret', 'secret-token'], onExit);
	t.true(setAuth.calledWith('secret-token'));
});

test(`when repos against the input does exist`, async (t) => {
	await Index.main(['--secret', 'secret-token'], onExit);
	t.true(
		selectPrompt.calledWith([
			{
				full_name: 'nimish-gupta/get-oss',
				repo: 'get-oss',
				owner: 'nimish-gupta',
			},
		])
	);
});

test.serial(`prints the output of the email on screen`, async (t) => {
	await Index.main(['--secret', 'secret-token'], onExit);
	t.true(
		formatter.calledWith({
			emailsWithUser: [
				{
					name: 'Nimish Gupta',
					login: 'nimish-gupta',
					email: 'gnimish03@gmail.com',
				},
			],
		})
	);
});

// searchPrompt.callCount

test.serial(`when repo doesn't exist for the repo input`, async (t) => {
	t.context.repoStub.resolves(Fixture.repos(true));
	const actual = await Index.main(['--secret', 'secret-token'], onExit);
	t.false(actual);
});

// test('get contributors name', async (t) => {
// 	await Index.main(['--secret', 'secret-token'], onExit);
// 	t.true(searchStub.calledWith({ query: 'nimish-gupta/get-oss' }));
// });
