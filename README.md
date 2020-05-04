# get-oss

This will help in getting the email of top contributors from the repo.

[![npm version](https://badge.fury.io/js/get-oss.svg)](https://badge.fury.io/js/get-oss)

## Install

- yarn - `yarn global add get-oss`
- npm - `npm install --global get-oss`

## Usage

Go to terminal and enter the following command:

`get-oss`

For getting more limit through github

`get-oss --secret <GITHUB_SECRET_TOKEN>`

For getting help for any command

`get-oss --help`

## Development

1. Run through terminal enter `yarn start:dev` in the root of the repo
2. Run through docker file

   - Create the docker image using `docker image build -t get-oss .`.
   - Run the container using `docker container run --rm get-oss`.

3. Run through docker-compose, enter `docker-container run --name get-oss`
