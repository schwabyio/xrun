////////////////////////////////////////////////////////////////////////////////
//   newman.js - Newman (Postman) methods.                                    //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const util = require('node:util')
const path = require('node:path')

const newmanModule = require('newman')
const newmanRun = util.promisify(newmanModule.run)
const marked = require('marked')
const escapeHtml = require('escape-html')
const prism = require('prismjs')
const loadLanguages = require('prismjs/components/')

const appInfo = require('./appInfo')
const timeFunctions = require('./timeFunctions')
const numberFunctions = require('./numberFunctions')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const newman = function newman() {
    const self = this
    const app = new appInfo()
    const time = new timeFunctions()
    const number = new numberFunctions()

    //Set prismjs loadLanguages
    loadLanguages(['xml', 'json', 'properties'])


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    function getDateTimeOfRunPrintable() {
        const dateTimeOfRun = new Date()

        return dateTimeOfRun.toLocaleString("en-us", {
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
    }

    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.run = async function run(settings, postmanCollection, specialNewmanOptions) {
        const newmanOptions = self.constructPostmanOptions(settings, postmanCollection, specialNewmanOptions)

        try {
            const summary = await newmanRun(newmanOptions)

            const collectionResults = self.constructCollectionResults(summary, newmanOptions.iterationData)

            return collectionResults
        } catch (error) {
            throw new Error(`Oops, newman run resulted in the following error: ${error.stack}`)
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.constructPostmanOptions = function constructPostmanOptions(settings, postmanCollection, specialNewmanOptions) {
        const options = {}

        //Set options for newman.run
        options['collection'] = postmanCollection.collection
        options['globals'] = postmanCollection.globalVariables
        options['environment'] = postmanCollection.environmentVariables
        options['timeout'] = settings.timeoutCollection
        options['timeoutRequest'] = settings.timeoutRequest
        options['timeoutScript'] = settings.timeoutScript
        options['ignoreRedirects'] = settings.ignoreRedirects


        //Set optional options.sslExtraCaCerts
        if (specialNewmanOptions.trustedCaCertFilePath !== null) {
          options['sslExtraCaCerts'] = specialNewmanOptions.trustedCaCertFilePath
        }


        //Set optional options.iterationData (external data file - e.g. csv)
        const dataFilePath = getDataFilePath(specialNewmanOptions, postmanCollection)

        if (dataFilePath !== null) {
          options['iterationData'] = dataFilePath
        }


        //Set JUnit reporter
        if (settings.generateJUnitResults === true) {
          options['reporters'] = []
          options['reporter'] = {}
          options['reporters'].push('junit')
          //One junit file per test case / collection
          options['reporter']['junit'] = {"export": path.join(specialNewmanOptions.testResultsJUnitBasePath, postmanCollection.collection.info.name + '.xml')}
        }

        return options


        //////////////////////////////////////////////////////////////////////////
        //Get the data file path (if any) for the collection being run. A data
        //file is only used by the collection whose name matches the data file
        //name (e.g. data/MY_COLLECTION.csv is only used by 'MY_COLLECTION').
        //////////////////////////////////////////////////////////////////////////
        function getDataFilePath(specialNewmanOptions, postmanCollection) {
          const dataFilePathObject = specialNewmanOptions.dataFilePathObject
          const collectionName = getCollectionName(postmanCollection)

          if (dataFilePathObject == null || collectionName == null) {
            return null
          }

          if (dataFilePathObject.hasOwnProperty(collectionName)) {
            return dataFilePathObject[collectionName]
          }

          return null
        }


        //////////////////////////////////////////////////////////////////////////
        //
        //////////////////////////////////////////////////////////////////////////
        function getCollectionName(postmanCollection) {

          if (postmanCollection == null) {
            return null
          }

          if (postmanCollection.collection == null) {
            return null
          }

          if (postmanCollection.collection.info == null) {
            return null
          }

          return postmanCollection.collection.info.name
        }
    }


    ////////////////////////////////////////////////////////////////////////////
    //Construct collection results for a collection that could NOT be run (e.g.
    //newman itself errored). Reported as a failed collection with zero tests so
    //the error is never mistaken for a passing collection.
    ////////////////////////////////////////////////////////////////////////////
    self.constructErrorCollectionResults = function constructErrorCollectionResults(error, collectionName) {
        const collectionResults = {}
        const errorMessage = (error == null) ? 'Unknown error' : error.message

        collectionResults.collectionName = collectionName
        collectionResults.collectionDescriptionRaw = '```<NO CONTENT>```'
        collectionResults.collectionDescriptionHtml = marked.parse(collectionResults.collectionDescriptionRaw)
        collectionResults.dateTimeOfRunPrintable = getDateTimeOfRunPrintable()
        collectionResults.errorMessage = errorMessage
        collectionResults.errorMessageHtml = escapeHtml(errorMessage)
        collectionResults.stepsPassed = 0
        collectionResults.stepsFailed = 0
        collectionResults.xRunVersion = app.getVersion()
        collectionResults.dataFilePath = undefined
        collectionResults.iterationsTotal = 1
        collectionResults.steps = []

        collectionResults.executionTimeTotal = 0
        collectionResults.executionTimeTotalPrintable = time.millisecondsToReadableFormat(0)
        collectionResults.responseTimeAverage = 0

        //Tests stats - no tests were run
        collectionResults.testsTotal = 0
        collectionResults.testsTotalPrintable = number.withCommas(0)
        collectionResults.testsFailed = 0
        collectionResults.testsFailedPrintable = number.withCommas(0)
        collectionResults.testsPassed = 0
        collectionResults.testsPassedPrintable = number.withCommas(0)

        //Assertions stats - no assertions were run
        collectionResults.assertionsTotal = 0
        collectionResults.assertionsTotalPrintable = number.withCommas(0)
        collectionResults.assertionsFailed = 0
        collectionResults.assertionsFailedPrintable = number.withCommas(0)
        collectionResults.assertionsPassed = 0
        collectionResults.assertionsPassedPrintable = number.withCommas(0)

        collectionResults.collectionResult = 'failed'
        collectionResults.collectionPassed = false

        return collectionResults
    }


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.constructCollectionResults = function constructCollectionResults(summary, dataFilePath) {
        const collectionResults = {}
        const iterationsTotal = getIterationsTotal(summary)

        const dateTimeOfRunPrintable = getDateTimeOfRunPrintable()

        collectionResults.collectionName = summary.collection.name
        collectionResults.collectionDescriptionRaw = getCollectionDescriptionRaw(summary)
        collectionResults.collectionDescriptionHtml = getCollectionDescriptionHtml(collectionResults.collectionDescriptionRaw)
        collectionResults.dateTimeOfRunPrintable = dateTimeOfRunPrintable
        collectionResults.stepsPassed = 0
        collectionResults.stepsFailed = 0
        collectionResults.xRunVersion = app.getVersion()

        //External data file (Newman iterationData) - only set when the collection was run with one
        collectionResults.dataFilePath = (typeof dataFilePath === 'string') ? dataFilePath : undefined
        collectionResults.iterationsTotal = iterationsTotal
    
        //Steps
        collectionResults.steps = []
        Object.keys(summary.run.executions).forEach(function (index) {
          const item = summary.run.executions[index]

          const postmanRequestUrlObject = convertToCleanObject(item.request.url)
          const postmanRequestHeadersObject = convertToCleanObject(item.request.headers)
          const postmanResponseHeadersObject = convertToCleanObject(getItemResponse(item, 'headers'))
          const contentTypeRequest = getHeaderValue(postmanRequestHeadersObject, 'Content-Type')
          const contentTypeResponse = getHeaderValue(postmanResponseHeadersObject, 'Content-Type')
          const postmanAssertions = convertToCleanObject(item.assertions)
          const stepItem = {}
    
          stepItem.id = item.item.id
          stepItem.name = item.item.name
          stepItem.iteration = getItemIteration(item)

          //Only label steps with their iteration when the collection ran more than one iteration
          if (iterationsTotal > 1 && stepItem.iteration !== undefined) {
            stepItem.iterationLabel = `Iteration ${stepItem.iteration} -`
          }

          //request
          stepItem.request = {}
          stepItem.request.url = constructPostmanUrl(postmanRequestUrlObject)
          stepItem.request.headers = cleanupPostmanHeaders(postmanRequestHeadersObject)
          stepItem.request.headersHtml = escapeAndFormatHtml(convertHeadersToString(stepItem.request.headers), 'properties')
          stepItem.request.method = item.request.method
          stepItem.request.body = constructPostmanBody(item.request.body)
          stepItem.request.bodyHtmlEscaped = escapeAndFormatHtml(stepItem.request.body, contentTypeRequest)
    
          //response
          stepItem.response = {}
          stepItem.response.code = getItemResponse(item, 'code')
          stepItem.response.status = getItemResponse(item, 'status')
          stepItem.response.headers = cleanupPostmanHeaders(postmanResponseHeadersObject)
          stepItem.response.headersHtml = escapeAndFormatHtml(convertHeadersToString(stepItem.response.headers), 'properties')
          stepItem.response.body = constructPostmanBody(getItemResponse(item, 'stream'))
          stepItem.response.bodyHtmlEscaped = escapeAndFormatHtml(stepItem.response.body, contentTypeResponse)
          stepItem.response.responseSize = getItemResponse(item, 'responseSize')
          stepItem.response.responseTime = getItemResponse(item, 'responseTime')
          stepItem.response.failureMessage = null

          //Check for summary.run.failures
          if (summary.run.failures.length > 0) {

            for (const failure of summary.run.failures) {
              const error = failure.error
              const at = failure.at

              //Only failures belonging to this step (and, when running with a data
              //file, to this step's iteration)
              if (isFailureForStep(failure, item, stepItem)) {

                //Add failureMessage for 'request' type errors
                if (at === 'request') {
                  stepItem.response.failureMessage = "Error with 'request': " + error.message
                }

                //Add failureMessage for 'test-script' type errors
                if (at === 'test-script') {
                  stepItem.response.failureMessage = "Error with 'test-script': " + error.message
                }
              }
            }
          }

          //assertions
          stepItem.assertions = {}
          stepItem.assertions = constructAssertionsObject(postmanAssertions)

          //Update stepItem.stepResult
          if (stepItem.assertions.failedCount > 0 || stepItem.assertions.passedCount === 0) {
            stepItem.stepResult = 'failed'
            collectionResults.stepsFailed++
          } else {
            stepItem.stepResult = 'passed'
            collectionResults.stepsPassed++
          }

          collectionResults.steps.push(stepItem)
        })
    
        collectionResults.executionTimeTotal = (summary.run.timings.completed - summary.run.timings.started)
        collectionResults.executionTimeTotalPrintable = time.millisecondsToReadableFormat(collectionResults.executionTimeTotal)
        collectionResults.responseTimeAverage = Math.round(summary.run.timings.responseAverage)
    
        //Tests stats
        collectionResults.testsTotal = collectionResults.steps.length
        collectionResults.testsTotalPrintable = number.withCommas(collectionResults.testsTotal)
        collectionResults.testsFailed = collectionResults.stepsFailed
        collectionResults.testsFailedPrintable = number.withCommas(collectionResults.testsFailed)
        collectionResults.testsPassed = collectionResults.stepsPassed
        collectionResults.testsPassedPrintable = number.withCommas(collectionResults.testsPassed)
    
        //Assertions stats
        collectionResults.assertionsTotal = summary.run.stats.assertions.total
        collectionResults.assertionsTotalPrintable = number.withCommas(collectionResults.assertionsTotal)
        collectionResults.assertionsFailed = summary.run.stats.assertions.failed
        collectionResults.assertionsFailedPrintable = number.withCommas(collectionResults.assertionsFailed)
        collectionResults.assertionsPassed = (collectionResults.assertionsTotal - collectionResults.assertionsFailed)
        collectionResults.assertionsPassedPrintable = number.withCommas(collectionResults.assertionsPassed)

        if ( (collectionResults.assertionsFailed > 0) || (collectionResults.testsFailed > 0) ) {
          collectionResults.collectionResult = 'failed'
          collectionResults.collectionPassed = false
        } else {
          collectionResults.collectionResult = 'passed'
          collectionResults.collectionPassed = true
        }
    
        return collectionResults
    

        //////////////////////////////////////////////////////////////////////////////
        //Total number of iterations run for the collection. This is 1 unless the
        //collection was run with an external data file (one iteration per row).
        //////////////////////////////////////////////////////////////////////////////
        function getIterationsTotal(summary) {

          if (summary == null || summary.run == null || summary.run.stats == null) {
            return 1
          }

          if (summary.run.stats.iterations == null) {
            return 1
          }

          if (typeof summary.run.stats.iterations.total !== 'number' || summary.run.stats.iterations.total < 1) {
            return 1
          }

          return summary.run.stats.iterations.total
        }


        //////////////////////////////////////////////////////////////////////////////
        //Iteration number (1 based) the execution belongs to
        //////////////////////////////////////////////////////////////////////////////
        function getItemIteration(item) {

          if (item == null || item.cursor == null) {
            return undefined
          }

          if (typeof item.cursor.iteration !== 'number') {
            return undefined
          }

          return item.cursor.iteration + 1
        }


        //////////////////////////////////////////////////////////////////////////////
        //
        //////////////////////////////////////////////////////////////////////////////
        function isFailureForStep(failure, item, stepItem) {

          if (failure.source == null || failure.source.name !== stepItem.name) {
            return false
          }

          const failureIteration = getItemIteration(failure)
          const stepIteration = getItemIteration(item)

          //Only compare iterations when both are known (multiple iterations only
          //happen when a collection is run with an external data file)
          if (failureIteration !== undefined && stepIteration !== undefined) {
            return (failureIteration === stepIteration)
          }

          return true
        }


        function getItemResponse(item, propertyName) {
          //Supported response properties:
          //  response.code
          //  response.status
          //  response.headers
          //  response.stream
          //  response.responseSize
          //  response.responseTime

          if (item.hasOwnProperty('response')) {
            if (item.response !== undefined) {
              if (item.response.hasOwnProperty(propertyName)) {
                if (item.response[propertyName] !== undefined) {
                  return item.response[propertyName]
                }
              }
            }
          }

          //Catch all - return nothing
          if (propertyName === 'headers') {
            return []
          } else {
            return ''
          }
          
        }
    
    
        function escapeAndFormatHtml(inputString, contentType) {
          var outputString = ""
          //TODO: loadLanguages(['xml', 'json', 'properties'])
    
    
          if (inputString == null) {
            outputString = inputString
          } else {
    
            if (contentType != null) {
              const jsonTest = new RegExp('application\/json', 'i')
              const xmlTest = new RegExp('application\/xml', 'i')
              
              if (jsonTest.test(contentType)) {

                try {
                  const jsonPretty = JSON.stringify(JSON.parse(inputString), null, 2)
                  outputString = prism.highlight(jsonPretty, prism.languages.json, 'json')
                } catch (e) {
                  //Just use inputString
                  outputString = prism.highlight(inputString, prism.languages.json, 'json')
                }
                
              } else if (xmlTest.test(contentType)) {
                outputString = prism.highlight(inputString, prism.languages.xml, 'xml')
              } else if (contentType === "properties") {
                outputString = prism.highlight(inputString, prism.languages.properties, 'properties')
              } else {
                outputString = escapeHtml(inputString)
              }
            } else {
              outputString = escapeHtml(inputString)
            }
          }
    
          return outputString
        }
    
    
        function convertToCleanObject(dirtyObject) {
    
          if (dirtyObject == null) {
            return undefined
          } else {
            return JSON.parse(JSON.stringify(dirtyObject))
          }
        }
    
    
        function getCollectionDescriptionRaw(summary) {
          
          if (summary.hasOwnProperty('collection')) {
            if (summary.collection.hasOwnProperty('description')) {
              return summary.collection.description.content
            }
          }
    
          return '```<NO CONTENT>```'
        }
    
    
        function getCollectionDescriptionHtml(collectionDescriptionRaw) {
          
          return marked.parse(collectionDescriptionRaw)
        }
    
    
        function constructAssertionsObject(postmanAssertions) {
          const assertionsObject = {}
          assertionsObject.passedCount = 0
          assertionsObject.failedCount = 0
          assertionsObject.list = []
    
          if (postmanAssertions != null) {
            assertionsObject.totalCount = postmanAssertions.length
    
            for (const item of postmanAssertions) {
              const assertion = {}
              
              if (item.hasOwnProperty('error')) {
                assertion.passed = false
                assertion.failureName = item.error.name
                assertion.failureMessage = item.error.message
                assertion.assertionResult = 'failed'
                assertionsObject.failedCount++
              } else {
                assertion.passed = true
                assertion.failureName = undefined
                assertion.failureMessage = undefined
                assertion.assertionResult = 'passed'
                assertionsObject.passedCount++
              }
      
              assertion.skipped = item.skipped
              assertion.assertionDetail = item.assertion
      
              assertionsObject.list.push(assertion)
            }
          } else {
            //Do Nothing
          }
    
          return assertionsObject
        }
    
    
        function constructPostmanUrl(postmanUrl) {

          if (postmanUrl.host == null) {
            return undefined
          } else {
            const protocol = postmanUrl.protocol || ''
            const host = constructPostmanHost(postmanUrl.host)
            const port = constructPostmanPort(postmanUrl.port)
            const path = constructPostmanPath(postmanUrl.path)
            const query = constructPostmanQuery(postmanUrl.query)
      
            //Construct request url
            const requestUrl = protocol + '://' + host + port + path + query
      
            return requestUrl
          }
        }
    
        
        function constructPostmanHost(postmanHost) {
          if (postmanHost == null) {
            return undefined
          } else {
            let host = ''
            for (const part of postmanHost) {
              host += part + '.'
            }
      
            if (host.length > 0) {
              host = host.substring(0, host.length - 1)
            }
      
            return host
          }
        }
    
    
        function constructPostmanPort(postmanPort) {
          if (postmanPort == null) {
            return ''
          } else {
            return ':' + postmanPort
          }
        }
    
    
        function constructPostmanPath(postmanPath) {
          if (postmanPath == null) {
            return undefined
          } else {
            let path = ''
            for (const part of postmanPath) {
              path += '/' + part
            }
      
            return path
          }
        }
    
    
        function constructPostmanQuery(postmanQuery) {
          if (postmanQuery == null) {
            return undefined
          } else {
            const queryParameterList = []

            for (const item of postmanQuery) {
              const key = item.key
              const value = item.value

              //Disabled query parameters are not sent by Postman
              if (item.disabled === true) {
                continue
              }

              if (value == null) {
                //A query parameter without a value (e.g. '?key')
                queryParameterList.push(key)
              } else {
                queryParameterList.push(key + '=' + value)
              }
            }

            if (queryParameterList.length === 0) {
              return ''
            }

            //Query parameters are separated by '&' (e.g. '?key1=value1&key2=value2')
            return '?' + queryParameterList.join('&')
          }
        }
    
    
        function constructPostmanBody(postmanBody) {
          var body = undefined
    
    
          if (Buffer.isBuffer(postmanBody)) {
            //Buffer
            body = postmanBody.toString('utf8')
          } else if (postmanBody !== undefined) {
            //Request body raw format
            if (postmanBody.hasOwnProperty('mode')) {
              if (postmanBody.mode === 'raw') {
                if (postmanBody.hasOwnProperty('raw')) {
                  body = postmanBody.raw
                }
              }
            }
          }
    
          return body
        }
    
    
        function cleanupPostmanHeaders(postmanRequestHeadersObject) {
          var headers = []
    
          for (const item of postmanRequestHeadersObject) {
            const header = {}
            header.key = item.key
            header.value = item.value
    
            headers.push(header)
          }
    
          return headers
        }
    
    
        function convertHeadersToString(headersObject) {
          var headersString = ''
    
          for (const item of headersObject) {
            headersString += item.key + ': ' + item.value + '\n'
          }
    
          return headersString
        }

        //////////////////////////////////////////////////////////////////////////////
        //
        //////////////////////////////////////////////////////////////////////////////  
        function getHeaderValue(headerObject, headerKey) {
          var headerValue = undefined
          const regex = new RegExp(headerKey, 'i')
          
          if (headerObject == null) {
            return headerValue
          } else {
            headerObject.forEach((item, index, array) => {
              if (regex.test(item.key)) {
                if (headerValue == null) {
                  headerValue = item.value
                } else {
                  headerValue += item.value + '; '
                }
              }
            })
          }

          return headerValue
        }
    }
}

module.exports = newman