![Postman Image](https://assets.getpostman.com/common-share/postman-logo-horizontal-320x132.png)


## Table of Contents
- [Overview](#overview)
- [Installation Steps](#installation-steps)
- [Usage](#usage)
- [Configurations](#configurations)


<br>

# xRunner - CLI Runner Interface Runner For Postman

## Overview
xRunner is a command line interface (CLI) app that extends [Newman](https://github.com/postmanlabs/newman) to enable your organization to run Postman tests with speed and at scale. These are the xRunner specific features:
* Direct support for [xtest](https://github.com/schwabyio/xtest)
* Run tests locally or as part of Continuous Integration (CI) testing
* Configuration support using a settings.json file with command line override capability
* Run Postman tests in parallel with a simple configurable `limitConcurrency` setting
* Group tests for projects however you like using project-level test suites.json definition files
* Test results in html format that are intuitive and easy to understand
* Summary results sent to your chosen Slack channel

<br>


## Installation Steps
1. Prerequisite: Install [Node.js](https://nodejs.org/en/download/) (skip step if you already have)
2. Clone xRunner project in the location of your choice (i.e. `[YOUR-GIT-BASE-PATH]`):
```console
git clone git@github.com:schwabyio/xrunner.git
```
3. Install dependencies:
```console
cd xrunner
npm install
```
4. Create the following settings.json file (NOTE: this file is not stored in Git):
```console
[YOUR-GIT-BASE-PATH]/xrunner/settings/settings.json
```
5. Edit the settings.json with the configurations for your testing needs. All configurations are documented [here](lib/config.js). NOTE: comments are allowed. Below is an example:
```console
{
    "limitConcurrency": 10,
    "autoOpenTestResultHtml": true,
    //"sendSummaryResultsToSlack": true,
    "slackChannel": "C04XXXXXXXX",
    "slackToken": "xoxb-XXXXXXXXXXXXXXXXXXXXXXXXX",
    "slackHardAlertOnFailure": true,
    "projectName": "xtest",
    "environmentType": "dev1",
    "xRunnerProjectPath": "[YOUR-GIT-BASE-PATH]/xtest/tests/postman",
    "suiteId": "regression"
  }
```

<br>


## Usage
```console
$ ./xRunner.js 
__________________________________________________________________________________________________________________________________
                                                                                                                                  
                                                         xRunner Ver. 1.0.0
__________________________________________________________________________________________________________________________________


   USAGE:  $ ./xRunner.js <program-command> [--settingsKey settingsValue]


          <program-command> - Required. Valid program-command values are:

                                          g[et]  - GET a list of Postman collections within the given suiteId.
                                          a[ll]  - Run ALL Postman collections within the given suiteId.
                               <collectionList>  - Run one or more Postman collections within the given suiteId by providing a
                                                   csv list of COLLECTION NAMEs.

    --settingsKey settingsValue - Optional. Any number of settings overrides.

__________________________________________________________________________________________________________________________________
```

<br>

## Configurations
All available configurations with documentation and defaults can be viewed here:
https://github.com/schwabyio/xrunner/lib/config.js

Configuration Order of Precedence (lowest to highest):
1. Default value
2. Local settings.json override
3. Environment variables override
4. Command line argument override
