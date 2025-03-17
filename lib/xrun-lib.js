////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//    xrun-lib.js - Library for xRun.                                         //
//                                                                            //
//                      Created by: schwaby.io                                //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const canAccessPath = require('./canAccessPath')
const getXRunDirectoryList = require('./getXRunDirectoryList')
const xRunCLI = require('./xRunCLI')
const runTests = require('./runTests')
const createXRunObject = require('./createXRunObject')
const createXRunObjectFromCsvList = require('./createXRunObjectFromCsvList')
const filterXRunObjectFromCollectionList = require('./filterXRunObjectFromCollectionList')
const Settings = require('./settings')


//TODO: Add tests for:
//htmlResults.js
//newman.js
//settings.js
//runTests.js
//xrun-lib.js
//slack.js
//sendSummaryResultsToSlack.js
//Later: httpClient.js, uploadTestResultsToWebserver.js

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const xRunLib = function xRunLib() {
  const self = this
  const cli = new xRunCLI()
  const tests = new runTests()


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getSettings = async function getSettings(settingsPath) {
    try {
      const setting = new Settings()

      const processCwdPath = await self.getProcessCwdPath()

      const settings = await setting.init(settingsPath, processCwdPath)

      return settings
    } catch (errMsg) {
      throw errMsg
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getUsage = async function returnUsage() {

    try {

      return cli.getUsage()
    } catch (errMsg) {
      throw errMsg
    }
    
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getPostmanTests = async function getPostmanTests(settings) {

    try {
      
      const directoryList = await getXRunDirectoryList(settings)

      const xRunObject = await createXRunObject(settings, directoryList)

      const collectionInfoString = cli.getCollectionInfo(settings, xRunObject)

      return collectionInfoString
    } catch (errMsg) {
        throw errMsg
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.runAllPostmanTests = async function runAllPostmanTests(settings) {

    try {

      const directoryList = await getXRunDirectoryList(settings)

      const xRunObject = await createXRunObject(settings, directoryList)

      const defaultTestResultsBasePath = await self.getDefaultTestResultsBasePath()

      const testFinalResult = await tests.run(settings, xRunObject, defaultTestResultsBasePath)

      return testFinalResult
    } catch (errMsg) {
        throw errMsg
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.runCSVPostmanTests = async function runCSVPostmanTests(settings, csvList) {

    try {

      const xRunObject = await createXRunObjectFromCsvList(settings, csvList)

      const defaultTestResultsBasePath = await self.getDefaultTestResultsBasePath()

      const testFinalResult = tests.run(settings, xRunObject, defaultTestResultsBasePath)

      return testFinalResult
    } catch (errMsg) {
        throw errMsg
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.initializeSettingsPath = async function initializeSettingsPath() {

    try {
      
      const xrunDirectoryPath = await self.getXrunDirectoryPath()

      //Ensure we can access xrunDirectoryPath
      try {
          await canAccessPath(xrunDirectoryPath)
      } catch (error) {
          errMsg = `Oops, xrun must be run from the tests case project root directory which includes an 'xrun' folder.`
          throw new Error(errMsg)
      }

      const settingsPath = await self.getSettingsPath()

      //Ensure we can access settingsPath
      try {
        await canAccessPath(settingsPath)
      } catch (error) {
        errMsg = `Oops, the test case project 'xrun' folder is missing the required 'settings.json' configuration.`
        throw new Error(errMsg)
      }

      //Confirm we can read the settings file
      const settings = await self.getSettings(settingsPath)

      return settingsPath
    } catch (errMsg) {
      throw errMsg
    }

  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getProcessCwdPath = async function getProcessCwdPath() {

    try {
      return process.cwd()
    } catch (errMsg) {
      throw errMsg
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getXrunDirectoryPath = async function getXrunDirectoryPath() {

    try {
      return path.join(await self.getProcessCwdPath(), 'xrun')
    } catch (errMsg) {
      throw errMsg
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getSettingsPath = async function getSettingsPath() {

    try {
      return path.join((await self.getXrunDirectoryPath()), 'settings.json')
    } catch (errMsg) {
      throw errMsg
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getDefaultTestResultsBasePath = async function getDefaultTestResultsBasePath() {

    try {
      return path.join((await self.getXrunDirectoryPath()), 'test-results')
    } catch (errMsg) {
      throw errMsg
    }
  }

}

module.exports = xRunLib