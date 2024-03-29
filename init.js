#! /usr/bin/env node
const path = require("path");
const fs = require("fs");

const rootPath = path.resolve(process.env.INIT_CWD || process.cwd());
const packageJsonFile = path.resolve(rootPath, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, "utf8"));
const configsPath = path.resolve("configs");
const configFiles = ["cypress.config.ts"];
const tsConfigFile = path.resolve(rootPath, "tsconfig.json");
const cypressPath = path.resolve(rootPath, "cypress");
const featuresPath = path.resolve(cypressPath, "features");
const sampleFeatureFile = path.resolve(featuresPath, "sample.feature");
const sampleStepFile = path.resolve(featuresPath, "sample.js");

const getRelativePath = (p) => path.relative(rootPath, p);

const updatePackageJson = () => {
  fs.writeFileSync(
    packageJsonFile,
    JSON.stringify(
      {
        ...packageJson,
        scripts: {
          ...packageJson.scripts,
          "tester:g": "tester-generate $1",
          "tester:r": "cypress run",
          "tester:ui": "cypress open",
        },
      },
      null,
      2
    ),
    "utf8"
  );
  console.log(`🟢 ${getRelativePath(packageJsonFile)} updated.`);
};

const updateTSConfig = () => {
  if (!fs.existsSync(tsConfigFile)) {
    fs.copyFileSync(path.resolve(configsPath, "tsconfig.json"), tsConfigFile);
    console.log(`🟢 ${getRelativePath(tsConfigFile)} created.`);
  } else {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigFile, "utf8"));
    fs.writeFileSync(
      tsConfigFile,
      JSON.stringify(
        {
          ...tsConfig,
          compilerOptions: {
            ...tsConfig.compilerOptions,
            baseUrl: tsConfig.compilerOptions.baseUrl || ".",
            paths: {
              ...(tsConfig.compilerOptions.paths || {}),
              "@badeball/cypress-cucumber-preprocessor/*": [
                "./node_modules/@badeball/cypress-cucumber-preprocessor/dist/subpath-entrypoints/*",
              ],
            },
          },
        },
        null,
        2
      ),
      "utf8"
    );
    console.log(`🟢 ${getRelativePath(tsConfigFile)} updated.`);
  }
};

const addConfigs = () => {
  configFiles.forEach((file) => {
    let target = path.resolve(rootPath, file);
    if (!fs.existsSync(target)) {
      fs.copyFileSync(path.resolve(configsPath, file), target);
      console.log(`🟢 ${getRelativePath(target)} created.`);
    } else {
      console.log(`🟠 ${getRelativePath(target)} already exists.`);
    }
  });
};

const generateSampleFeature = () => {
  if (!fs.existsSync(sampleFeatureFile)) {
    fs.copyFileSync(
      path.resolve(configsPath, "sample.feature"),
      sampleFeatureFile
    );
    fs.copyFileSync(path.resolve(configsPath, "sample.js"), sampleStepFile);
    console.log(
      `🟢 ${getRelativePath(sampleFeatureFile)} and ${sampleStepFile} created.`
    );
  }
};

const generateCypressFolders = () => {
  if (!fs.existsSync(cypressPath)) {
    fs.mkdirSync(cypressPath);
  }
  if (!fs.existsSync(featuresPath)) {
    fs.mkdirSync(featuresPath);
    generateSampleFeature();
  }
};

addConfigs();
updatePackageJson();
updateTSConfig();
generateCypressFolders();

