![xRun Image](./resources/images/xrun-logo-500.png)
<!-- ![Postman Image](https://assets.getpostman.com/common-share/postman-logo-horizontal-320x132.png) -->
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/schwabyio/xrun/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@schwabyio%252Fxrun)](https://www.npmjs.com/package/@schwabyio/xrun) [![code coverage](https://img.shields.io/badge/Code%20Coverage-97.43%25-green)](https://img.shields.io)

## Table of Contents

- [xRun - CLI Runner For Postman](#xrun---cli-runner-for-postman)
  - [Overview](#overview)
  - [Features](#features)
  - [Installation Steps](#installation-steps)
  - [Uninstall Steps](#uninstall-steps)
  - [xRun Project Repo Structure](#xrun-project-repo-structure)
  - [Example xRun Project Repo](#example-xrun-project-repo)
  - [Data Files](#data-files)
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
* Generates clean html reports that allow you to quickly filter and zero in on test failures.
* Generate junit reports (provided by Postman's Newman).
* Configurable settings.json file with command line override capability.
* By default, all folders (and tests within) are run. You can exclude folders using an exclusion list.
* Single out one or more tests to run by specifying a CSV list of test cases and/or directories from the command line.
* Drive a collection with an external data file (`.csv` or `.json`) - the collection is run one time per data file row.

<br>

## Installation Steps
1. Install Node.js (version >= 20) ([recommended to install Node.js using node version manager](https://github.com/nvm-sh/nvm))
2. Install (and also to update) xRun:
```shell
npm install -g @schwabyio/xrun
```
<br>

## Uninstall Steps
1. Uninstall xRun
```shell
npm uninstall -g @schwabyio/xrun
```
<br>

## xRun Project Repo Structure
The xRun tool requires a Postman project repo to be in the following structure:
```
└── <your-project-repo>/
    ├── <directory1-with-postman-json-files>/
    ├── <directory2-with-postman-json-files>/
    ...
    ├── <directoryN-with-postman-json-files>/
    └── xrun/
        ├── data/                          <-- optional (see Data Files)
        │   └── <collection-name>.csv
        ├── exclude-list.json
        └── settings.json
```
Note: You can only run the `xrun` CLI command from the root directory of `<your-project-repo>`.

<br>

## Example xRun Project Repo
Example repo in structure required by xRun (also runnable - try it out):
[xrun-example-repo](https://github.com/schwabyio/xrun-example-repo)

<br>

## Data Files
A collection can be driven by an external data file (`.csv` or `.json`) - the same iteration data Newman supports. Each row of the data file runs the collection one time, and each column is available to the collection as a variable (e.g. `{{userId}}`) and through `pm.iterationData`.

Data files live in `<your-project-repo>/xrun/data/` and a data file is **only** used by the collection whose COLLECTION NAME matches the data file name:
```
└── <your-project-repo>/
    └── xrun/
        └── data/
            ├── MY_COLLECTION.csv          <-- only used by the 'MY_COLLECTION' collection
            └── MY_OTHER_COLLECTION.json   <-- only used by the 'MY_OTHER_COLLECTION' collection
```

Example `xrun/data/MY_COLLECTION.csv` (the first row must be the column names):
```csv
userId,userName
1001,user1
1002,user2
```
The `MY_COLLECTION` collection above is run 2 times: once with `{{userId}}` set to `1001` and once with `{{userId}}` set to `1002`.

Notes:
* Collections without a matching data file run normally (one time).
* The data file directory location is configurable using the `dataFileDirectoryPath` setting.
* When both a `.csv` and a `.json` data file exist for the same collection name, the `.csv` file is used.
* Data file runs are reported per iteration in the collection html report.

<br>

## Usage
```shell
% xrun
__________________________________________________________________________________________________________________________________
                                                                                                                                  
                                                         xRun Ver. 3.5.0
__________________________________________________________________________________________________________________________________


   USAGE: xrun <program-command> [--settingsKey settingsValue]


              <program-command> - Required. Valid program-command values are:

                                          g[et]  - GET a list of all Postman collections from the project.

                                                   NOTE: collections from xrun/exclude-list.json ARE NOT included.

                                          a[ll]  - Run ALL Postman collections from the project.

                                                   NOTE: collections from xrun/exclude-list.json ARE NOT included.

                 <collectionAndOrDirectoryList>  - Run one or more specific Postman collections from the project by
                                                   providing a comma seperated list of COLLECTION NAMEs and/or DIRECTORY NAMEs.

                                                   NOTE: collections from xrun/exclude-list.json ARE included.

    --settingsKey settingsValue - Optional. Any number of settings overrides.

__________________________________________________________________________________________________________________________________
```

<br>


## Settings
All available settings (settings.json) are [documented here](./lib/json/settings-schema.json).

Settings Order of Precedence (lowest to highest):
1. Default value
2. Local settings.json override
3. Environment variables override
4. Command line argument override
