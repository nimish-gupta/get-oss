const test = require('ava');
const PassThroughStream = require('stream').PassThrough;
const getStream = require('get-stream');

const Util = require('../utils');

const successPromise = () => Promise.resolve('success');
const errorPromise = () => Promise.reject(new Error('fail'));

test('promisify resolves', async (t) => {
	const promise = await Util.promisify(successPromise());
	t.deepEqual(promise, ['success', null]);
});

test('promisify rejects', async (t) => {
	const promise = await Util.promisify(errorPromise());
	t.deepEqual(promise, [null, 'fail']);
});

test('exitPromise resolves', async (t) => {
	const promise = await Util.exitPromise(successPromise(), '');
	t.is(promise, 'success');
});

test('exitPromise rejects', async (t) => {
	const promise = await Util.exitPromise(errorPromise(), 'test', (x) => x);
	t.is(promise, 'Could not query repo for test due to, fail');
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

	const promise = await Util.spinnerPromise(successPromise(), msg, {
		stream: t.context.stream,
	});
	t.context.stream.end();
	const output = await getStream(t.context.stream);

	t.is(output, `- ${msg}\n`);
	t.is(promise, 'success');
});

test('spinnerPromise reject', async (t) =>
	await t.throwsAsync(
		async () => Util.spinnerPromise(Promise.reject(new Error('fail')), ''),
		{ instanceOf: Error, message: 'fail' }
	));
