////////////////////////////////////////////////////////////////////////////////
//   xRunCLI.js - Methods for xrun command line interface.                    //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const os = require('node:os')
const readline = require("node:readline/promises")

const colors = require('@colors/colors')

const appInfo = require('./appInfo')
const stringCompare = require('./stringCompare')
const stringFunctions = require('./stringFunctions')

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const xRunCLI = function xRunCLI() {
    const self = this
    const EOL = os.EOL
    const app = new appInfo()
    const appVersion = app.getVersion()
    const appCLIName = app.getCLIName()
    const strComp = new stringCompare()
    const strFunc = new stringFunctions()


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.promptUserForSettingsPath = async function promptUserForSettingsPath() {
      const rl = readline.createInterface({terminal: true, input: process.stdin, output: process.stdout})

      try {
        const settingsPath = await rl.question(`What is the absolute path to your xrun settings.json file? `)

        return settingsPath
      } catch (error) {
        throw error
      }
    }
  

    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.getUsage = function getUsage() {
        const usage =  "__________________________________________________________________________________________________________________________________" + EOL +
        "                                                                                                                                  " + EOL +
        "                                                         xRun Ver. " + appVersion + EOL +
        "__________________________________________________________________________________________________________________________________" + EOL + EOL + EOL +
        "   USAGE: " + appCLIName + " <program-command> [--settingsKey settingsValue]" + EOL + EOL + EOL +
        "          <program-command> - Required. Valid program-command values are:" + EOL + EOL +
        "                                          g[et]  - GET a list of Postman collections within the given xRunProjectPath." + EOL +
        "                                          a[ll]  - Run ALL Postman collections within the given xRunProjectPath." + EOL +
        "                               <collectionList>  - Run one or more Postman collections within the given xRunProjectPath" + EOL +
        "                                                   by providing a csv list of COLLECTION NAMEs." + EOL + EOL +
        "    --settingsKey settingsValue - Optional. Any number of settings overrides." + EOL + EOL +
        "__________________________________________________________________________________________________________________________________" + EOL
    
        return usage
    }


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.getCollectionInfo = function getCollectionInfo(settings, xRunObject) {
        const collectionInfoObject = {}
        let collectionInfoString = ''
        let directoryName = ''
        let collectionName = ''
        let truncatedCollectionName = ''
        let collectionCounter = 0
        let collectionTestCount = 0
    
        //Set collectionInfoString header
        collectionInfoString = '__________________________________________________________________________________________________________________________________' + EOL +
                               '                                                                                                                                  ' + EOL +
                               '                                               Collection List (sorted first by Directory Name then Collection Name)' + EOL +
                               '__________________________________________________________________________________________________________________________________' + EOL +
                               'projectName: ' + settings.projectName + EOL + EOL +
                               'Col # Collection Name                                                                        Tests  Directory Name                ' + EOL +
                               '_____ _____________________________________________________________________________________ _______ ______________________________' + EOL
    
    
        //Set collectionInfoObject
        for (const postmanCollection of xRunObject.postmanCollections) {
            directoryName = postmanCollection.directoryName
            collectionName = postmanCollection.collection.info.name
            collectionTestCount = postmanCollection.collection.item.length
      
            //Initialize collectionInfoObject[directoryName]
            if (! collectionInfoObject.hasOwnProperty(directoryName)) {
              collectionInfoObject[directoryName] = {}
            }
      
            //Set collectionInfoObject[directoryName][collectionName]
            collectionInfoObject[directoryName][collectionName] = collectionTestCount
        }
    
        //Loop over collectionInfoObject in sorted manner

        Object.keys(collectionInfoObject).sort(strComp.insensitive).forEach(function (directoryName) {
          Object.keys(collectionInfoObject[directoryName]).sort(strComp.insensitive).forEach(function (collectionName) {
            //Increment collectionCounter
            collectionCounter++
    
            truncatedCollectionName = collectionName.substring(0, 85)
    
            //Set collectionInfoString
            collectionInfoString += strFunc.padStart(collectionCounter.toString(), 5, ' ') + ' ' +
                                    strFunc.padEnd(truncatedCollectionName, 85, ' ') + ' ' +
                                    strFunc.padStart(collectionInfoObject[directoryName][collectionName].toString(), 7, ' ') + ' ' +
                                    directoryName + EOL
          })
        })
    
        collectionInfoString += '__________________________________________________________________________________________________________________________________' + EOL
    
        return collectionInfoString
    }



    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.getTestOutputHeader = function getTestOutputHeader(settings, xRunObject) {
        const line = EOL +
        '__________________________________________________________________________________________________________________________________________________________________________' + EOL + EOL +
        '                                                                       xRun Version ' + appVersion + EOL +
        '__________________________________________________________________________________________________________________________________________________________________________' + EOL + EOL +
        'Settings: ' + EOL +
        'Project Name: ' + settings.projectName + EOL +
        'Total Number of Collections to Run: ' + xRunObject.postmanCollections.length + EOL +
        'Environment Type: ' + settings.environmentType + EOL +
        'Concurrency Limit: ' + settings.limitConcurrency + EOL +
        'Collection Time Out: ' + settings.timeoutCollection + ' ms' + EOL +
        'Request Time Out: ' + settings.timeoutRequest + ' ms' + EOL +
        'Script Time Out: ' + settings.timeoutScript + ' ms' + EOL +
        '__________________________________________________________________________________________________________________________________________________________________________' + EOL +
        '                                                                                                                                                                          ' + EOL +
        'Results Overview:                                                                                                                                                         ' + EOL +
        '__________________________________________________________________________________________________________________________________________________________________________' + EOL +
        '                                                                                             Col Run   Total   Tests   Tests    Total     Assertions  Assertions   Col    ' + EOL +
        'Col # Collection Name                                                                         Time     Tests   Pass    Fail   Assertions     Pass        Fail     Result  ' + EOL +
        '----- ------------------------------------------------------------------------------------- --------- ------- ------- ------- ----------- ----------- ----------- ------- ' + EOL

        return line
    }


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.getTestOutputResult = function getTestOutputResult(collectionCompleteCounter, collectionResults) {
        let testResult = ''

        const truncatedCollectionName = collectionResults.collectionName.substring(0, 85)

        if (collectionResults.collectionResult === 'failed') {
          testResult = colors.red('failed')
        } else {
          testResult = colors.green('passed')
        }
  
        const line = collectionCompleteCounter.toString().padStart(5, ' ') + ' ' +
               truncatedCollectionName.padEnd(85, ' ') +  ' ' +
               collectionResults.executionTimeTotalPrintable.padEnd(9, ' ') + ' ' +
               collectionResults.testsTotalPrintable.padEnd(7, ' ') + ' ' +
               collectionResults.testsPassedPrintable.padEnd(7, ' ') + ' ' +
               collectionResults.testsFailedPrintable.padEnd(7, ' ') + ' ' +
               collectionResults.assertionsTotalPrintable.padEnd(11, ' ') + ' ' +
               collectionResults.assertionsPassedPrintable.padEnd(11, ' ') + ' ' +
               collectionResults.assertionsFailedPrintable.padEnd(11, ' ') + ' ' +
               testResult + EOL
  
        return line
    }


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.getTestOutputFooter = function getTestOutputFooter(testResultSummary) {
        let testFinalResult = ''

        if (testResultSummary.collectionsFailed > 0) {
            testFinalResult = colors.red('FAILED')
          } else {
            testFinalResult = colors.green('PASSED')
          }
    
          const line = '__________________________________________________________________________________________________________________________________________________________________________' + EOL +
                 'Summary Stats:' + EOL +
                 'Total Collections: ' + testResultSummary.collectionsTotalPrintable + ', Collections Passed: ' + testResultSummary.collectionsPassedPrintable + ', Collections Failed: ' + testResultSummary.collectionsFailedPrintable + EOL +
                 'Total Tests: ' + testResultSummary.tallyTestsTotalPrintable + ', Tests Passed: ' + testResultSummary.tallyTestsPassedPrintable + ', Tests Failed: ' + testResultSummary.tallyTestsFailedPrintable + EOL +
                 'Total Assertions: ' + testResultSummary.tallyAssertionsTotalPrintable + ', Assertions Passed: ' + testResultSummary.tallyAssertionsPassedPrintable + ', Assertions Failed: ' + testResultSummary.tallyAssertionsFailedPrintable + EOL +
                 'Total Run Time: ' + testResultSummary.testDurationTotalPrintable + EOL +
                 'Final Result: ' + testFinalResult + EOL +
                 '__________________________________________________________________________________________________________________________________________________________________________' + EOL
    
          return line
    }
}

module.exports = xRunCLI