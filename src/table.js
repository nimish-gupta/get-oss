const Table = require('cli-table');

const Log = require('./log');

const formatter = (emailsWithUser) => {
	if (emailsWithUser.length === 0) {
		console.log(
			Log.text(
				`Sorry no emails under the current repo, please try another repo :)`
			)
		);
		return '';
	}
	const table = new Table({
		head: [
			Log.text('User Name'),
			Log.text('Full Name'),
			Log.text('Github Link'),
			Log.text('Email'),
		],
		chars: {
			top: '═',
			'top-mid': '╤',
			'top-left': '╔',
			'top-right': '╗',
			bottom: '═',
			'bottom-mid': '╧',
			'bottom-left': '╚',
			'bottom-right': '╝',
			left: '║',
			'left-mid': '╟',
			mid: '─',
			'mid-mid': '┼',
			right: '║',
			'right-mid': '╢',
			middle: '│',
		},
	});
	emailsWithUser.forEach((user) =>
		table.push([
			user.login,
			user.name,
			Log.url(`https://github.com/${user.login}`),
			Log.url(`mailto:${user.email}`),
		])
	);

	console.log(table.toString());
};

module.exports = { formatter };
