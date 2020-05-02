const inquirer = require("inquirer");

//export const SearchPrompt = inquirer.createPromptModule();


const getSearchPrompt = async () => {
    const answers = await inquirer.prompt([{
        type: 'input',
        name: 'repo_query',
        message: 'Enter the repo to be searched:'
    }]);
    return answers;
};


module.exports = { getSearchPrompt };
