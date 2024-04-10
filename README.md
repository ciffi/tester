# tester

Node utilities for testing

## install

```bash
npm install -D @ciffi-js/tester
or
yarn add --dev @ciffi-js/tester
```

## configure env variables

_You can use .env file_

_TESTER_BASE_URL is required_

- TESTER_JIRA_EMAIL
- TESTER_JIRA_TOKEN
- TESTER_JIRA_URL
- TESTER_JIRA_FIELD
- TESTER_BASE_URL

## generate features and steps

generate feature and steps form JIRA (expected feature in issue description)

```bash
npm run tester:r JIRA-ISSUE-ID
or
yarn tester:r JIRA-ISSUE-ID
```

genrate steps form feature file

```bash
npm run tester:g FILE-NAME
or
yarn tester:g FILE-NAME
```

run tests in terminal

```bash
npm run tester:r
or
yarn tester:r
```

run tests in browser

```bash
npm run tester:ui
or
yarn tester:ui
```

## write feature file

add your feature file in folder `cypress/features`
