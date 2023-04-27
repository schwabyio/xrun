////////////////////////////////////////////////////////////////////////////////
//   runTests.js - Run postman tests.                                         //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')
const { mkdir } = require('node:fs/promises')
const EventEmitter = require('node:events')

const rimraf = require('rimraf')

const timeFunc = require('./timeFunctions')
const xRunCLI = require('./xRunCLI')
const appInfo = require('./appInfo')
const Newman = require('./newman')
const htmlResults = require('./htmlResults')
const numberFunctions = require('./numberFunctions')
const asyncLimit = require('./asyncLimit')
const sendSummaryResultsToSlack = require('./sendSummaryResultsToSlack')

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const runTests = function runTests() {
    const self = this
    const cli = new xRunCLI()
    const time = new timeFunc()
    const app = new appInfo()
    const html = new htmlResults()
    const number = new numberFunctions()
    const eventEmitter = new EventEmitter()
    const newman = new Newman()


    eventEmitter.on('taskCompleted', (index, result) => {
      
      if (result) {
        //Write out test result
        process.stdout.write(cli.getTestOutputResult(index, result))
      }

    })


    eventEmitter.on('taskError', (index, result) => {
      
      if (result) {
        process.stdout.write(`TODO: Error: ${index} - ${result}\n`)
      }

    })


    self.run = async function run(settings, xRunObject) {
      const limitConcurrency = settings.limitConcurrency
      const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')
      const summaryTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-summary.hbs')
      const testResultsBasePath = path.join(__dirname, '../', 'test-results')
      const testResultsProjectPath = path.join(testResultsBasePath, settings.projectName)
      const testResultsProjectHtmlPath = path.join(testResultsProjectPath, 'html')
      const summaryHtmlPath = path.join(testResultsProjectHtmlPath, 'summary.html')
      let collectionCompleteCounter = 0
      let collectionFailCounter = 0
      let tallyTestsTotal = 0
      let tallyTestsFailed = 0
      let tallyTestsPassed = 0
      let tallyAssertionsTotal = 0
      let tallyAssertionsFailed = 0
      let tallyAssertionsPassed = 0
      const testStartTime = time.inSeconds()
      let testEndTime = 0
      let totalTestDuration = ''
      let testFinalResult = ''
      const testResultSummary = {}
      const dateTimeOfRun = new Date()
      const dateTimeOfRunPrintable = dateTimeOfRun.toLocaleString("en-us", {
        hour12: true,
        weekday: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        month: "long",
        year: "numeric",
        timeZoneName: "long"
      })
  
  
      //Set initial testResultSummary properties
      testResultSummary['xRunVersion'] = app.getVersion()
      testResultSummary['projectName'] = settings.projectName
      testResultSummary['environmentType'] = settings.environmentType
      testResultSummary['totalNumberOfCollections'] = xRunObject['postmanCollections'].length
      testResultSummary['concurrencyLimit'] = limitConcurrency
      testResultSummary['timeoutCollection'] = settings.timeoutCollection
      testResultSummary['timeoutRequest'] = settings.timeoutRequest
      testResultSummary['timeoutScript'] = settings.timeoutScript
      testResultSummary['collectionResults'] = []
  
  
      process.stdout.write(cli.getTestOutputHeader(settings, xRunObject))
  

      try {
          //Delete testResultsProjectHtmlPath (if already exists)
          await rimraf(testResultsProjectHtmlPath)

          //Create testResultsProjectHtmlPath
          await mkdir(testResultsProjectHtmlPath, { recursive: true })
      } catch (error) {
          throw new Error("Oops, got an error trying to create the following test results directory path '" + testResultsProjectHtmlPath + "': " + error.message)
      }


      try {

        

        //Create tasks array for running postman collections
        const runPMCTasks = []
        for (const postmanCollection of xRunObject.postmanCollections) {
          runPMCTasks.push(() => newman.run(settings, postmanCollection))
        }

        const results = await asyncLimit(limitConcurrency, runPMCTasks, eventEmitter)
  
        
        //Set testEndTime
        testEndTime = time.inSeconds()

        //Get totalTestDuration
        totalTestDuration = time.differenceReadableFormat(testStartTime, testEndTime)


        //Create tasks array for creating collection html reports
        const createCHRtasks = []
        for (const result of results) {
          const postmanCollectionName = result.collectionName
          const testResultsCollectionHtmlPath = path.join(testResultsProjectHtmlPath, postmanCollectionName + '.html')


          createCHRtasks.push(() => html.createCollectionHtmlReport(collectionTemplatePath, result, testResultsCollectionHtmlPath))
        }
      
        await asyncLimit(limitConcurrency, createCHRtasks, eventEmitter)


        for (const collectionResult of results) {
          //Tally report data
          
          collectionCompleteCounter++

          if (collectionResult.collectionResult === 'failed') {
            collectionFailCounter++
          }
    
          //Tally data from collectionResult for testResultSummary
          tallyTestsTotal += collectionResult.testsTotal
          tallyTestsFailed += collectionResult.testsFailed
          tallyTestsPassed += collectionResult.testsPassed
          tallyAssertionsTotal += collectionResult.assertionsTotal
          tallyAssertionsFailed += collectionResult.assertionsFailed
          tallyAssertionsPassed += collectionResult.assertionsPassed
    
          testResultSummary['collectionResults'].push(collectionResult)
        }


        if (collectionFailCounter > 0) {
          testFinalResult = 'FAILED'
        } else {
          testFinalResult = 'PASSED'
        }

        //Set final testResultSummary properties
        testResultSummary['dateTimeOfRunPrintable'] = dateTimeOfRunPrintable
        testResultSummary['tallyTestsTotal'] = tallyTestsTotal
        testResultSummary['tallyTestsTotalPrintable'] = number.withCommas(tallyTestsTotal)
        testResultSummary['tallyTestsFailed'] = tallyTestsFailed
        testResultSummary['tallyTestsFailedPrintable'] = number.withCommas(tallyTestsFailed)
        testResultSummary['tallyTestsPassed'] = tallyTestsPassed
        testResultSummary['tallyTestsPassedPrintable'] = number.withCommas(tallyTestsPassed)
        testResultSummary['tallyAssertionsTotal'] = tallyAssertionsTotal
        testResultSummary['tallyAssertionsTotalPrintable'] = number.withCommas(tallyAssertionsTotal)
        testResultSummary['tallyAssertionsFailed'] = tallyAssertionsFailed
        testResultSummary['tallyAssertionsFailedPrintable'] = number.withCommas(tallyAssertionsFailed)
        testResultSummary['tallyAssertionsPassed'] = tallyAssertionsPassed
        testResultSummary['tallyAssertionsPassedPrintable'] = number.withCommas(tallyAssertionsPassed)
        testResultSummary['collectionsTotal'] = collectionCompleteCounter
        testResultSummary['collectionsTotalPrintable'] = number.withCommas(collectionCompleteCounter)
        testResultSummary['collectionsFailed'] = collectionFailCounter
        testResultSummary['collectionsFailedPrintable'] = number.withCommas(collectionFailCounter)
        testResultSummary['collectionsPassed'] = (collectionCompleteCounter - collectionFailCounter)
        testResultSummary['collectionsPassedPrintable'] = number.withCommas(testResultSummary['collectionsPassed'])
        testResultSummary['testDurationTotalPrintable'] = totalTestDuration
        testResultSummary['testFinalResult'] = testFinalResult

        process.stdout.write(cli.getTestOutputFooter(testResultSummary))


        //Post run operations

        //createSummaryHtmlReport
        await html.createSummaryHtmlReport(settings, summaryTemplatePath, testResultSummary, summaryHtmlPath)


        //TODO: uploadTestResultsToWebserver
        const testResultsUrl = undefined

        //sendSummaryResultsToSlack
        await sendSummaryResultsToSlack(settings, testResultSummary, testResultsUrl)

      } catch (error) {
        throw error
      }
      
  }

}


module.exports = runTests