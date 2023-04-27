![xRun Image](./resources/images/xrun-logo-500.png)
<!-- ![Postman Image](https://assets.getpostman.com/common-share/postman-logo-horizontal-320x132.png) -->


## Table of Contents
- [Overview](#overview)
- [Demos](#demos)
  1. [Demo Primary Commands](#demo-primary-commands)
  2. [Demo Reporting](#demo-reporting)
- [Installation Steps](#installation-steps)
- [Usage](#usage)
- [Configurations](#configurations)


<br>

# xRun - CLI Runner For Postman

## Overview
xRun is a command line interface (CLI) app that extends [Newman](https://github.com/postmanlabs/newman) to enable your organization to run Postman tests with speed and at scale. These are the xRun specific features:
* Direct support for [xtest](https://github.com/schwabyio/xtest)
* Run tests locally or as part of Continuous Integration (CI) testing
* Configuration support using a settings.json file with command line override capability
* Run Postman tests in parallel with a simple configurable `limitConcurrency` setting
* Group tests for projects however you like using project-level test suites.json definition files
* Test results in html format that are intuitive and easy to understand
* Summary results sent to your chosen Slack channel

<br>


## Demos

### Demo Primary Commands



https://user-images.githubusercontent.com/118861343/221046986-2bb87d92-eb49-4531-b9f0-7f65d9ed540c.mp4




### Demo Reporting



https://user-images.githubusercontent.com/118861343/218165353-4081377f-78aa-4a14-9861-4f88ab1f39e8.mp4




<br>

## Installation Steps
1. Prerequisite: Install [Node.js](https://nodejs.org/en/download/) (skip step if you already have)
2. Clone xRun project in the location of your choice (i.e. `[YOUR-GIT-BASE-PATH]`):
```console
git clone git@github.com:schwabyio/xrun.git
```
3. Install dependencies:
```console
cd xrun
npm install
```
4. Create the following settings.json file (NOTE: this file is not stored in Git):
```console
[YOUR-GIT-BASE-PATH]/xrun/settings/settings.json
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
    "xRunProjectPath": "[YOUR-GIT-BASE-PATH]/xtest/tests/postman"
  }
```

<br>


## Usage
```console
$ ./xRun.js 
__________________________________________________________________________________________________________________________________
                                                                                                                                  
                                                         xRun Ver. 1.0.0
__________________________________________________________________________________________________________________________________


   USAGE:  $ ./xRun.js <program-command> [--settingsKey settingsValue]


          <program-command> - Required. Valid program-command values are:

                                          g[et]  - GET a list of Postman collections within the given xRunProjectPath.
                                          a[ll]  - Run ALL Postman collections within the given xRunProjectPath.
                               <collectionList>  - Run one or more Postman collections within the given xRunProjectPath by
                                                   providing a csv list of COLLECTION NAMEs.

    --settingsKey settingsValue - Optional. Any number of settings overrides.

__________________________________________________________________________________________________________________________________
```

<br>

## Configurations
All available configurations are documented here:
https://github.com/schwabyio/xrun/lib/config.js

Configuration Order of Precedence (lowest to highest):
1. Default value
2. Local settings.json override
3. Environment variables override
4. Command line argument override
