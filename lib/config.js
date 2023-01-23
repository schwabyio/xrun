////////////////////////////////////////////////////////////////////////////////
//     config.js - Configuration definitions for xRunner.js.                  //
//                                                                            //
//                Created by: schwaby.io                                      //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
const path = require('path')
const convict = require('convict');
const json5 = require('json5')

// Custom format validation
convict.addFormat({
  name: 'nat-not-zero',
  validate: function(val) {
    if (!/^\+?([1-9]\d*)$/.test(val)) {
      throw new Error(`value must be a natural number (positive integer) and also not zero: '${val}'`);
    }
  }
})

// Define a schema
var config = convict({
  timeoutCollection: {
    doc: "Newman timeout - Specify the time (in milliseconds) to wait for the entire collection run to complete execution.",
    format: "nat-not-zero",
    default: 3600000,
    arg: "timeoutCollection"
  },
  timeoutRequest: {
    doc: "Newman timeoutRequest - Specify the time (in milliseconds) to wait for requests to return a response.",
    format: "nat-not-zero",
    default: 600000,
    arg: "timeoutRequest"
  },
  timeoutScript: {
    doc: "Newman timeoutScript - Specify the time (in milliseconds) to wait for scripts to complete execution.",
    format: "nat-not-zero",
    default: 600000,
    arg: "timeoutScript"
  },
  autoOpenTestResultHtml: {
    doc: "Auto open test result in web browser after a run.",
    format: Boolean,
    default: false,
    arg: "autoOpenTestResultHtml"
  },
  uploadTestResultsToWebserver: {
    doc: "Upload html test results to web server (for CI).",
    format: Boolean,
    default: false,
    arg: "uploadTestResultsToWebserver"
  },
  numberOfDaysToKeepTestResultsOnWebserver: {
    doc: "Upload html test results to web server (for CI).",
    format: "nat",
    default: 30,
    arg: "numberOfDaysToKeepTestResultsOnWebserver"
  },
  sendSummaryResultsToSlack: {
    doc: "Send summary test results to slack (for CI).",
    format: Boolean,
    default: false,
    arg: "sendSummaryResultsToSlack"
  },
  slackIconTestsPass: {
    doc: "Slack icon to use when all tests pass.",
    format: "*",
    default: ":pass:",
    arg: "slackIconTestsPass"
  },
  slackIconTestsFail: {
    doc: "Slack icon to use when one or more tests fail.",
    format: "*",
    default: ":fail:",
    arg: "slackIconTestsFail"
  },
  slackChannel: {
    doc: "Slack channel to use.",
    format: "*",
    default: "",
    arg: "slackChannel"
  },
  slackHardAlertOnSuccess: {
    doc: "Send a hard alert to slack channel (to get notified) on success.",
    format: Boolean,
    default: false,
    arg: "slackHardAlertOnSuccess"
  },
  slackHardAlertOnFailure: {
    doc: "Send a hard alert to slack channel (to get notified) on failure.",
    format: Boolean,
    default: false,
    arg: "slackHardAlertOnFailure"
  },
  slackToken: {
    doc: "Slack bot token (begins with 'xoxb'). See here for more info on how to create: https://api.slack.com/authentication/basics",
    format: "*",
    default: "",
    arg: "slackToken"
  },
  limitConcurrency: {
    doc: "The maximum number of test cases you want to allow running concurrently/parallel.",
    format: "nat-not-zero",
    default: 1,
    arg: "limitConcurrency"
  },
  projectName: {
    doc: "The name of the project you are running tests against (used in reports, slack, etc.).",
    format: "*",
    default: "",
    arg: "projectName"
  },
  environmentType: {
    doc: "The environment you want to run your tests against. (e.g. specifies which <xRunnerProjectPath>/xrunner/<environmentType>.bulk file to use.)",
    format: "*",
    default: "",
    arg: "environmentType"
  },
  xRunnerProjectPath: {
    doc: "The local xRunner project path. (i.e. the local absolute path location of Postman tests in xRunner project format.)",
    format: "*",
    default: undefined,
    arg: "xRunnerProjectPath"
  },
  suiteId: {
    doc: "The suite identifier defined within <xRunnerProjectPath>/xrunner/suites.json that you want to run.",
    format: "*",
    default: undefined,
    arg: "suiteId"
  },
  ignoreRedirects: {
    doc: "Instructs Postman to ignore redirects.",
    format: Boolean,
    default: true,
    arg: "ignoreRedirects"
  }
})

// Support JSON5 format (e.g. json comments)
convict.addParser({extension: 'json', parse: json5.parse})

//Load configuration file
try {
  config.loadFile(path.join(__dirname, '../settings', 'settings.json'))
} catch (error) {
  throw new Error(`Oops, unable to load settings.json file: ${error.message}`)
}

//Perform validation
try {
  config.validate({allowed: 'strict'})
} catch (error) {
  throw new Error(`Oops, settings.json validation error: ${error.message}`)
}


module.exports = config
