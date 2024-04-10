#! /usr/bin/env node
const path = require("path");
const fs = require("fs");
const spawn = require("child_process").spawn;
const dotenv = require("dotenv");

dotenv.config();

const fueaturID = process.argv.slice(2)[0];

if (!fueaturID) {
  console.log("Please provide an issue ID");
  process.exit(1);
}

const rootPath = path.resolve(process.env.INIT_CWD || process.cwd());
const cypressPath = path.join(rootPath, "cypress");
const featuresPath = path.join(cypressPath, "features");
const stepsExtension = ".js";
const featureFile = path.join(featuresPath, `${fueaturID}.feature`);
const stepFile = path.join(featuresPath, `${fueaturID}${stepsExtension}`);

if (fs.existsSync(featureFile) && fs.existsSync(stepFile)) {
  console.log(`Feature and steps for issue ${fueaturID} already exist`);
  return;
}

if (fs.existsSync(featureFile) && !fs.existsSync(stepFile)) {
  useCucumber();
  return;
}

const {
  TESTER_JIRA_EMAIL,
  TESTER_JIRA_TOKEN,
  TESTER_JIRA_URL,
  TESTER_JIRA_FIELD,
} = process.env;

if (!TESTER_JIRA_EMAIL || !TESTER_JIRA_TOKEN || !TESTER_JIRA_URL) {
  console.log(
    "Please provide TESTER_JIRA_EMAIL, TESTER_JIRA_TOKEN, and TESTER_JIRA_URL"
  );
  process.exit(1);
}

const authString = `${TESTER_JIRA_EMAIL}:${TESTER_JIRA_TOKEN}`;
const basicAuth = Buffer.from(authString).toString("base64");
const headers = new Headers();
headers.append("Authorization", `Basic ${basicAuth}`);

const requestOptions = {
  method: "GET",
  headers,
  redirect: "follow",
};

fetch(
  `${TESTER_JIRA_URL}/rest/api/latest/issue/${fueaturID}?fields=summary,${TESTER_JIRA_FIELD}`,
  requestOptions
)
  .then((response) => response.json())
  .then((result) => ({
    id: result.key,
    summary: result.fields.summary,
    description: result.fields.description,
  }))
  .then(writeFeatureFile)
  .catch((error) => console.log("error", error));

function useCucumber() {
  const process = spawn("cucumber-js", [
    "--dry-run",
    "--format",
    "snippets",
    "--format-options",
    `${JSON.stringify({ snippetInterface: "synchronous" })}`,
    "--require",
    stepFile,
    featureFile,
  ]);
  process.stdout.on("data", (data) => {
    writeStepsFile(data);
  });
  process.stderr.on("data", (data) => {
    console.log(`🤬 Error: ${data}`);
  });
  process.on("exit", (code) => {
    if (code === 0) {
      console.log(`Feature created for issue ${fueaturID}`);
    } else {
      console.log(`child process exited with code ${code}`);
    }
  });
}
function writeFeatureFile(feature) {
  const featureStringTitle = `Feature: ${feature.summary}\n`;
  const featureScenario = `${feature.description}\n`;
  if (!fs.existsSync(cypressPath)) {
    fs.mkdirSync(cypressPath);
  }
  if (!fs.existsSync(featuresPath)) {
    fs.mkdirSync(featuresPath);
  }
  fs.writeFileSync(featureFile, featureStringTitle + featureScenario, "utf8");
  useCucumber();
}

function writeStepsFile(steps) {
  const defaultImports = `import { When, Then, Given } from "@badeball/cypress-cucumber-preprocessor";\n`;
  if (!fs.existsSync(stepFile)) {
    fs.writeFileSync(stepFile, defaultImports, "utf8");
  }
  fs.appendFileSync(stepFile, `\n${steps}`, "utf8");
}

