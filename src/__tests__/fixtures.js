const username = 'nimish-gupta',
	email = 'gnimish03@gmail.com',
	repo = 'get-oss',
	name = 'Nimish Gupta';

const fixtures = {
	repos: (empty = false) => ({
		data: {
			items: empty
				? []
				: [
						{
							full_name: `${username}/${repo}`,
							name: repo,
							owner: { login: username },
						},
				  ],
		},
	}),
	contributors: {
		data: [{ login: username }],
	},
	events: (empty = false) => ({
		data: [
			{
				payload: {
					commits: empty ? [] : [{ author: { name, email } }],
				},
			},
		],
	}),
	user: (noEmail = false) => ({
		data: { name, login: username, ...(noEmail ? {} : { email }) },
	}),
	ownedRepos: {
		data: [
			{
				name: repo,
			},
		],
	},
	commits: (empty = false) => ({
		data: empty
			? []
			: [
					{
						commit: {
							author: { name, email },
						},
					},
			  ],
	}),
	searchPrompt: {
		repoQuery: `${username}/${repo}`,
	},
	selectPrompt: {
		repo: `${username}/${repo}`,
	},
	confirmPrompt: (ans = true) => ({
		searchAgain: ans,
	}),
};

module.exports = fixtures;
