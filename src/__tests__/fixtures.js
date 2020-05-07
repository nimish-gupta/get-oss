const username = 'nimish-gupta',
	email = 'gnimish03@gmail.com',
	repo = 'get-oss',
	name = 'Nimish Gupta';

const fixtures = {
	repos: {
		data: {
			items: [
				{
					full_name: `${username}/${repo}`,
					name: repo,
					owner: { login: username },
				},
			],
		},
	},
	contributors: {
		data: [{ login: username }],
	},
	events: {
		data: [
			{
				payload: {
					commits: [{ author: { name, email } }],
				},
			},
		],
	},
	user: {
		data: { email, name, login: username },
	},
	noEmailUser: {
		data: { name, login: username },
	},
	commits: {},
};

module.exports = fixtures;
