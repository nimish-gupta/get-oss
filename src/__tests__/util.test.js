const test = require('ava');
const PassThroughStream = require('stream').PassThrough;
const getStream = require('get-stream');
const stripAnsi = require('strip-ansi');

const Util = require('../utils');

test('promisify resolves', async (t) => {
	const promise = await Util.promisify(Promise.resolve('success'));
	t.deepEqual(promise, ['success', null]);
});

test('promisify rejects', async (t) => {
	const promise = await Util.promisify(Promise.reject('fail'));
	t.deepEqual(promise, [null, 'fail']);
});

test('exitPromise resolves', async (t) => {
	const promise = await Util.exitPromise(Promise.resolve('success'));
	t.is(promise, 'success');
});

test('exitPromise rejects', async (t) => {
	const promise = await Util.exitPromise(Promise.reject('fail'));
	t.is(promise, 'fail');
});

test.before((t) => {
	const noop = () => {};
	const stream = new PassThroughStream();
	stream.clearLine = noop;
	stream.cursorTo = noop;
	stream.moveCursor = noop;
	t.context.stream = stream;
});

test.only('spinnerPromise resolves', async (t) => {
	const promise = await Util.spinnerPromise(
		Promise.resolve('success'),
		'test',
		t.context.stream
	);
	t.context.stream.end();
	const output = await getStream(t.context.stream);
	console.log({ output });
	t.deepEqual(promise, 'success');
});
