# Custom Drive

This project is a server-side application built using JavaScript/NodeJS and the Serverless framework. It connects to Google Drive and provides functionality to list files, download files, and retrieve a list of users who have access to a specific file. The application also supports real-time updates, displaying events when users are added or removed from a file.

## Table of Contents
- [Installation](#installation)
- [Demo](#demo)
- [Documentation](#documentation)
- [Testing](#testing)
- [Usage](#usage)
- [Deployment](#deployment)
- [Author](#author)
- [License](#license)

## Installation

1. Clone the repository: `git clone https://github.com/sanjeevmalagi1/custom-drive`
2. Use currect node version by running `nvm use` (node v16.14.0)
2. Install dependencies: `npm install`

## Usage

1. Copy contents of `.env.example` to `.env` file and replace them with your own creadentials.
2. Run the application on your local machine: `npx serverless offline --stage offline`

## Demo
Watch the Loom video for a step-by-step guide and a demonstration of the features:
https://www.loom.com/share/2bf55a28b3bb4da4bca565f66f3cfd86

In depth explaination of the code:
https://www.loom.com/share/900dd4b0104b4721814fdb43d24b4523

## Documentation
The api documentation is available on https://documenter.getpostman.com/view/15272127/2s9YypG3q4

## Testing

- Run tests: `npm test`
- Generate coverage report: `npm run-script coverage`

## Deployment

This project is deployed using the Serverless framework on AWS. It uses AWS parameters store to pick up the environment variables for production deployment.
Make sure your aws account/profile is configured and and you have crated credentials on aws parameter store.

Use the following command to deploy:
- `npx serverless deploy`

## Author
Sanjeev M (sanjeevmalagi@gmail.com)

## License
MIT License
