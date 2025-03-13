////////////////////////////////////////////////////////////////////////////////
//   newman.js - Newman (Postman) methods.                                    //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const util = require('node:util')
const path = require('node:path')

const newmanModule = require('newman')
const newmanRun = util.promisify(newmanModule.run)
const { marked } = require('marked')
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
    self.run = async function run(settings, postmanCollection, specialNewmanOptions) {
        const newmanOptions = self.constructPostmanOptions(settings, postmanCollection, specialNewmanOptions)

        try {
            const summary = await newmanRun(newmanOptions)

            const collectionResults = self.constructCollectionResults(summary)

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


        //Set JUnit reporter
        if (settings.generateJUnitResults === true) {
          options['reporters'] = []
          options['reporter'] = {}
          options['reporters'].push('junit')
          //One junit file per test case / collection
          options['reporter']['junit'] = {"export": path.join(specialNewmanOptions.testResultsJUnitBasePath, postmanCollection.collection.info.name + '.xml')}
        }

        return options
    }


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.constructCollectionResults = function constructCollectionResults(summary) {
        const collectionResults = {}
    
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
    
        collectionResults.collectionName = summary.collection.name
        collectionResults.collectionDescriptionRaw = getCollectionDescriptionRaw(summary)
        collectionResults.collectionDescriptionHtml = getCollectionDescriptionHtml(collectionResults.collectionDescriptionRaw)
        collectionResults.dateTimeOfRunPrintable = dateTimeOfRunPrintable
        collectionResults.stepsPassed = 0
        collectionResults.stepsFailed = 0
        collectionResults.xRunVersion = app.getVersion()
    
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
              const source = failure.source

              //Add failureMessage for 'request' type errors
              if (at === 'request' && source.name === stepItem.name) {
                stepItem.response.failureMessage = error.message
              }

              //Add failureMessage for 'test-script' type errors
              if (at === 'test-script' && source.name === stepItem.name) {
                stepItem.response.failureMessage = error.message
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
          const protocol = postmanUrl.protocol || ''
          const host = constructPostmanHost(postmanUrl.host)
          const port = constructPostmanPort(postmanUrl.port)
          const path = constructPostmanPath(postmanUrl.path)
          const query = constructPostmanQuery(postmanUrl.query)
    
          //Construct request url
          const requestUrl = protocol + '://' + host + port + path + query
    
          return requestUrl
        }
    
        
        function constructPostmanHost(postmanHost) {
          var host = ''
          for (let part of postmanHost) {
            host += part + '.'
          }
    
          if (host.length > 0) {
            host = host.substring(0, host.length - 1)
          }
    
          return host
        }
    
    
        function constructPostmanPort(postmanPort) {
    
          if (postmanPort == null) {
            return ''
          } else {
            return ':' + postmanPort
          }
        }
    
    
        function constructPostmanPath(postmanPath) {
          var path = ''
          for (let part of postmanPath) {
            path += '/' + part
          }
    
          return path
        }
    
    
        function constructPostmanQuery(postmanQuery) {
          var query = ''
    
          if (postmanQuery.length > 0) {
            query += '?'
          }
    
          for (const item of postmanQuery) {
            let key = item.key
            let value = item.value
          
            query += key + '=' + value
          }
          
          return query
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