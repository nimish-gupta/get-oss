const test = require('ava');
const PassThroughStream = require('stream').PassThrough;
const getStream = require('get-stream');
const sinon = require('sinon');

const Util = require('../utils');

const successPromise = () => Promise.resolve('success');
const errorPromise = () => Promise.reject(new Error('fail'));

const processStub = sinon.stub();

test.before(() => {
	sinon.replace(process, 'exit', processStub);
	processStub.returnsArg(0);
});

test('promisify resolves', async (t) => {
	const promise = await Util.promisify(successPromise());
	t.deepEqual(promise, ['success', null]);
});

test('promisify rejects', async (t) => {
	const promise = await Util.promisify(errorPromise());
	t.deepEqual(promise, [null, 'fail']);
});

test('exitPromise resolves', async (t) => {
	const promise = await Util.exitPromise('', successPromise());
	t.is(promise, 'success');
});

test('exitPromise rejects', async (t) => {
	try {
		const promise = await Util.exitPromise('test', errorPromise());
		t.is(promise, 0);
		t.is(processStub.calledOnce, true);
	} catch (error) {
		console.log(error);
	}
});

test.beforeEach((t) => {
	const noop = () => {};
	const stream = new PassThroughStream();
	stream.clearLine = noop;
	stream.cursorTo = noop;
	stream.moveCursor = noop;
	t.context.stream = stream;
});

test('spinnerPromise resolves', async (t) => {
	const msg = 'test promise spinner';

	const promise = await Util.spinnerPromise(msg, {
		stream: t.context.stream,
	})(successPromise());
	t.context.stream.end();
	const output = await getStream(t.context.stream);

	t.is(output, `- ${msg}\n`);
	t.is(promise, 'success');
});

test('spinnerPromise reject', async (t) =>
	await t.throwsAsync(
		async () => Util.spinnerPromise('')(Promise.reject(new Error('fail'))),
		{ instanceOf: Error, message: 'fail' }
	));

test.after(() => {
	sinon.restore();
});
