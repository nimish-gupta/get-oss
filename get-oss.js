const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    userAgent: 'get-oss v1.2.3'
});

const search = async ({ query: q, page = 1 }) => {
    const repos = await octokit.search.repos({
        q,
        sort: "stars",
        order: "desc",
        per_page: 10,
        page,
    });
    console.log(repos);
};

const main = (argv) => {
    console.log(argv);
};

main(process.argv);
