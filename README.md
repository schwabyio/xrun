![xRun Image](./resources/images/xrun-logo-500.png)
<!-- ![Postman Image](https://assets.getpostman.com/common-share/postman-logo-horizontal-320x132.png) -->
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/schwabyio/xrun/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@schwabyio%252Fxrun)](https://www.npmjs.com/package/@schwabyio/xrun) [![code coverage](https://img.shields.io/badge/Code%20Coverage-80.32%25-green)](https://img.shields.io)

## Table of Contents

- [xRun - CLI Runner For Postman](#xrun---cli-runner-for-postman)
    - [Overview](#overview)
    - [Features](#features)
    - [Installation Steps](#installation-steps)
    - [Update Steps](#update-steps)
    - [Test Case Project Structure](#test-case-project-structure)
    - [Usage](#usage)
    - [Running](#running)
    - [Settings](#settings)


<br>

# xRun - CLI Runner For Postman

## Overview
xRun is a command line interface (CLI) app that extends [Newman](https://github.com/postmanlabs/newman) to enable your organization to run Postman tests with speed and at scale.

## Features
* Direct support for [xtest](https://github.com/schwabyio/xtest).
* Run Postman tests in parallel by setting the `limitConcurrency` configuration.
* Run tests locally or as part of Continuous Integration (CI) with your automated build server of choice.
* Generates clean html reports that allow you to quickly filter and zero in on test failures.
* Generate junit reports (provided by Postman's Newman).
* Get test summary and results sent to slack on your mobile device.
* Configurable settings.json file with command line override capability.
* By default, all folders (and tests within) are run. You can exclude folders using an exclusion list.
* Single out one or more tests to run by specifying a CSV list of test cases from the command line.

<br>

## Installation Steps
1. Install Node.js ([It's recommended to install Node.js using node version manager](https://github.com/nvm-sh/nvm)).
2. Install xRun ([See here if you receive EACCES permissions errors when installing packages globally](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)):
```console
npm install -g @schwabyio/xrun
```
<br>

## Update Steps
1. Update xRun
```console
npm update -g @schwabyio/xrun
```
<br>

## Test Case Project Structure
TODO

<br>

## Usage
```console
% xrun
__________________________________________________________________________________________________________________________________
                                                                                                                                  
                                                         xRun Ver. 2.5.0
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

## Running
TODO

<br>


## Settings
All available settings are [documented here](./lib/json/settings-schema.json).

Settings Order of Precedence (lowest to highest):
1. Default value
2. Local settings.json override
3. Environment variables override
4. Command line argument override
