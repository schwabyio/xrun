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
const config = require('./config')


//TODO: Add tests for:
//htmlResults.js
//newman.js
//config.js
//runTests.js
//xrun-lib.js
//Later: httpClient.js, slack.js, sendSummaryResultsToSlack.js, uploadTestResultsToWebserver.js

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const xRunLib = function xRunLib() {
  const self = this
  const cli = new xRunCLI()
  const tests = new runTests()
  self.settings = config.getProperties()
  self.collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getUsage = function returnUsage() {
    return cli.getUsage()
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

      const testFinalResult = await tests.run(settings, xRunObject)

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

      const testFinalResult = tests.run(settings, xRunObject)

      return testFinalResult
    } catch (errMsg) {
        throw errMsg
    }
  }

}

module.exports = xRunLib