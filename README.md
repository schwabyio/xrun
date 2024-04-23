![xRun Image](./resources/images/xrun-logo-500.png)
<!-- ![Postman Image](https://assets.getpostman.com/common-share/postman-logo-horizontal-320x132.png) -->
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/schwabyio/xrun/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@schwabyio%252Fxrun)](https://www.npmjs.com/package/@schwabyio/xrun) [![code coverage](https://img.shields.io/badge/Code%20Coverage-80.32%25-green)](https://img.shields.io)

## Table of Contents

- [xRun - CLI Runner For Postman](#xrun---cli-runner-for-postman)
    - [Overview](#overview)
    - [Features](#features)
    - [Installation Steps](#installation-steps)
    - [Update Steps](#update-steps)
    - [Usage](#usage)
    - [Settings](#settings)


<br>

# xRun - CLI Runner For Postman

## Overview
xRun is a command line interface (CLI) app that extends [Newman](https://github.com/postmanlabs/newman) to enable your organization to run Postman tests with speed and at scale.

## Features
* Direct support for [xtest](https://github.com/schwabyio/xtest).
* Run Postman tests in parallel by setting the `limitConcurrency` configuration.
* Run tests locally or as part of Continuous Integration (CI) with your automated build server of choice.
* Generates beautiful html reports that allow you to quickly filter and zero in on test failures.
* Generate junit reports (provided by Postman's Newman).
* Get test summary and results sent to slack on your mobile device.
* Configurable settings.json file with command line override capability.
* By default, all folders (and tests within) from the configured xRunProjectPath are run. You can exclude folders using an exclusion list.
* Single out one or more tests to run by specifying a CSV list of test cases from the command line.

<br>

## Installation Steps
1. Install Node.js ([It's recommended to install Node.js using node version manager](https://github.com/nvm-sh/nvm)).
2. Install xRun ([See here if you receive EACCES permissions errors when installing packages globally](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)):
```console
npm install -g @schwabyio/xrun
```
3. Create a local settings.json file (note the absolute path for step 4). Below is an example absolute path:
```console
/Users/john/xrun/settings.json
```
[See here for all available configurations](lib/json/settings-schema.json). Below is an example settings.json file:
```console
{
  "limitConcurrency": 10,
  "autoOpenTestResultHtml": true,
  //"sendSummaryResultsToSlack": true,
  "slackChannel": "C04XXXXXXXX",
  "slackToken": "xoxb-XXXXXXXXXXXXXXXXXXXXXXXXX",
  "slackHardAlertOnFailure": true,
  "projectName": "xtest",
  "environmentType": "qa",
  "xRunProjectPath": "[PATH-TO-PROJECT-THAT-CONTAINS-POSTMAN-COLLECTIONS]"
}
```
4. The first time you run 'xrun' on the command line you will be prompted for the absolute path to the settings.json file. Type or paste the absolute path to the settings.json you created in step 3 above. Below is an example:
```console
% xrun
No settings path is currently set. Please provide one below.
What is the absolute path to your xrun settings.json file? /Users/john/xrun/settings.json
The path you have provided is '/Users/john/xrun/settings.json'
```

<br>


## Update Steps
1. To update to the latest version, run the following command:
```console
npm update -g @schwabyio/xrun
```
2. The first time you run 'xrun' on the command line you will be prompted for the absolute path to the settings.json file. Type or paste the absolute path to the settings.json you created during step 3 of the install above. Below is an example:
```console
% xrun
No settings path is currently set. Please provide one below.
What is the absolute path to your xrun settings.json file? /Users/john/xrun/settings.json
The path you have provided is '/Users/john/xrun/settings.json'
```
<br>

## Usage
```console
% xrun
__________________________________________________________________________________________________________________________________
                                                                                                                                  
                                                         xRun Ver. 2.4.0
__________________________________________________________________________________________________________________________________


   USAGE: xrun <program-command> [--settingsKey settingsValue]


          <program-command> - Required. Valid program-command values are:

                                          g[et]  - GET a list of Postman collections within the given xRunProjectPath.
                                          a[ll]  - Run ALL Postman collections within the given xRunProjectPath.
                               <collectionList>  - Run one or more Postman collections within the given xRunProjectPath
                                                   by providing a csv list of COLLECTION NAMEs.

    --settingsKey settingsValue - Optional. Any number of settings overrides.

__________________________________________________________________________________________________________________________________
```

<br>

## Settings
All available settings are [documented here](./lib/json/settings-schema.json).

Settings Order of Precedence (lowest to highest):
1. Default value
2. Local settings.json override
3. Environment variables override
4. Command line argument override
