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

const getXRunDirectoryList = require('./getXRunDirectoryList')
const xRunCLI = require('./xRunCLI')
const runTests = require('./runTests')
const createXRunObject = require('./createXRunObject')
const filterXRunObjectFromCollectionList = require('./filterXRunObjectFromCollectionList')
const datastore = require('./datastore')
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
  const localAppPath = path.join(__dirname, '../settings/', 'app.json')
  const userDefinedSettingsPathName = "userDefinedSettingsPath"
  const ds = new datastore(localAppPath)


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getSettings = async function getSettings(settingsPath) {
    try {
      const setting = new Settings()

      const settings = await setting.init(settingsPath)

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

      const userDefinedSettingsPath = await self.getUserDefinedSettingsPath()

      const testFinalResult = await tests.run(settings, xRunObject, userDefinedSettingsPath)

      return testFinalResult
    } catch (errMsg) {
        throw errMsg
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.runCSVPostmanTests = async function runCSVPostmanTests(settings, collectionCSVList) {

    try {

      const directoryList = await getXRunDirectoryList(settings)

      const xRunObject = await createXRunObject(settings, directoryList)

      await filterXRunObjectFromCollectionList(xRunObject, collectionCSVList)
      
      const userDefinedSettingsPath = await self.getUserDefinedSettingsPath()

      const testFinalResult = tests.run(settings, xRunObject, userDefinedSettingsPath)

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
      const datastoreExists = await ds.exists()

      if (datastoreExists === true) {

        const settingsPath = await ds.getValue(userDefinedSettingsPathName)

        return settingsPath
      } else {
        console.log(`No settings path is currently set. Please provide one below.`)

        const settingsPath = await cli.promptUserForSettingsPath()

        console.log(`The path you have provided is '${settingsPath}'`)

        //Confirm we can read the settings file
        const settings = await self.getSettings(settingsPath)

        //Save for future use
        await ds.setValue(userDefinedSettingsPathName, settingsPath)

        return settingsPath
      }
    } catch (errMsg) {
      throw errMsg
    }

  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getUserDefinedSettingsPath = async function getUserDefinedSettingsPath() {

    try {
      const datastoreExists = await ds.exists()

      if (datastoreExists === true) {

        const settingsPath = await ds.getValue(userDefinedSettingsPathName)

        return settingsPath

      } else {
        return null
      }

    } catch (errMsg) {
      throw errMsg
    }
  }

}

module.exports = xRunLib