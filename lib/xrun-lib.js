////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//    xrun-lib.js - Library for xRun.                                   //
//                                                                            //
//                      Created by: schwaby.io                                //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
const path = require('path')
const os = require('os')
const fs = require('fs')
const util = require('util')

const newman = require('newman')
const eachLimit = require('async/eachLimit')
const colors = require('@colors/colors')
const { uuidV4: uuidv4 } = require('uuid');
const rimraf = require('rimraf')
const handlebars = require('handlebars')
const open = require('open')
const admzip = require('adm-zip')
const { marked } = require('marked')
const escapeHtml = require('escape-html')
const prism = require('prismjs')
const loadLanguages = require('prismjs/components/')

const config = require('./config')
const timeFunc = require('./timeFunctions')
const getArrayOfFilePathsForDirectory = require('./getArrayOfFilePathsForDirectory')
const readPostmanFile = require('./readPostmanFile')
const httpClient = require('./httpClient')
const getHostname = require('./getHostname')
const { version } = require('../package')
const Slack = require('./slack')



////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
var xRunLib = function xRun() {
  const self = this
  const EOL = os.EOL
  const time = new timeFunc()
  const hostname = new getHostname()
  self.settings = config.getProperties()


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getUsage = function returnUsage() {
    const programFileName = path.basename(require.main.filename)
    const usage =  "__________________________________________________________________________________________________________________________________" + EOL +
    "                                                                                                                                  " + EOL +
    "                                                         xRun Ver. " + version + EOL +
    "__________________________________________________________________________________________________________________________________" + EOL + EOL + EOL +
    "   USAGE:  \$ ./" + programFileName + " <program-command> [--settingsKey settingsValue]" + EOL + EOL + EOL +
    "          <program-command> - Required. Valid program-command values are:" + EOL + EOL +
    "                                          g[et]  - GET a list of Postman collections within the given suiteId." + EOL +
    "                                          a[ll]  - Run ALL Postman collections within the given suiteId." + EOL +
    "                               <collectionList>  - Run one or more Postman collections within the given suiteId by providing a" + EOL +
    "                                                   csv list of COLLECTION NAMEs." + EOL + EOL +
    "    --settingsKey settingsValue - Optional. Any number of settings overrides." + EOL + EOL +
    "__________________________________________________________________________________________________________________________________" + EOL

    return usage
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getDirectoryList = function getDL(callback) {
    var errMsg = ''
    var tempDirectoryList = []
    var directoryList = []
    var suitesDefinitions = {}
    const suitesParentDirectory = 'xrun'

    //Set suitesPath
    const suitesDirectoryPath = path.join(self.settings.xRunProjectPath, suitesParentDirectory)
    const suitesPath = path.join(suitesDirectoryPath, 'suites.json')


    //Check that directory exists
    fs.access(suitesDirectoryPath, function (err) {
      if (err) {
        errMsg = `Oops, there must be a directory named '${suitesParentDirectory}' within ${self.settings.xRunProjectPath} that contains a valid 'suites.json' file.`
        return callback(errMsg)
      } else {
        //Read suitesPath
        fs.readFile(suitesPath, function resultOfReadSuitesPath(err, data) {
          if (err) {
            errMsg = "Oops, unable to read suites file '" + suitesPath + "' due to the following: " + err.message
            return callback(errMsg)
          } else {
            //Parse to suitesDefinitions
            try {
              suitesDefinitions = JSON.parse(data.toString())
            } catch (err) {
              errMsg = "Oops, error converting suites file '" + suitesPath + "' to object: " + err.message
              return callback(errMsg)
            }

            tempDirectoryList = suitesDefinitions[self.settings.suiteId]

            if (tempDirectoryList.length === 0) {
              errMsg = "Oops, suiteId '" + self.settings.suiteId + "' in suites file '" + suitesPath + "' does not contain any directories."
              return callback(errMsg)
            } else {
              tempDirectoryList.forEach(function(directory) {
                if (path.isAbsolute(directory) === true) {
                  directoryList.push(directory)
                } else {
                  directoryList.push(path.join(self.settings.xRunProjectPath, directory))
                }
              })
      
              return callback(null, directoryList)
            }
          }
        })
      }
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.run = function runTests(xRunObject, commandLine, callback) {
    const limitConcurrency = self.settings.limitConcurrency
    const testResultsBasePath = path.join(__dirname, '../', 'test-results')
    const testResultsHtmlPath = path.join(testResultsBasePath, 'html')
    var collectionCompleteCounter = 0
    var collectionFailCounter = 0
    var tallyTestsTotal = 0
    var tallyTestsFailed = 0
    var tallyTestsPassed = 0
    var tallyAssertionsTotal = 0
    var tallyAssertionsFailed = 0
    var tallyAssertionsPassed = 0
    const testStartTime = time.inSeconds()
    var testEndTime = 0
    var totalTestDuration = ''
    var testFinalResult = ''
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
    testResultSummary['xRunVersion'] = version
    testResultSummary['projectName'] = self.settings.projectName
    testResultSummary['suiteId'] = self.settings.suiteId
    testResultSummary['environmentType'] = self.settings.environmentType
    testResultSummary['totalNumberOfCollections'] = xRunObject['postmanCollections'].length
    testResultSummary['concurrencyLimit'] = limitConcurrency
    testResultSummary['timeoutCollection'] = self.settings.timeoutCollection
    testResultSummary['timeoutRequest'] = self.settings.timeoutRequest
    testResultSummary['timeoutScript'] = self.settings.timeoutScript
    testResultSummary['collectionResults'] = []


    printCommandLineHeader(xRunObject, commandLine)

    //Delete testResultsBasePath (if already exists)
    rimraf(testResultsBasePath, function resultOfRimraf() {
      //Create testResultsBasePath
      fs.mkdir(testResultsBasePath, { recursive: true }, function resultOfMkdirp(err) {
        if (err) {
          errMsg = "Oops, got an error trying to create the following test results directory path '" + testResultsBasePath + "': " + err.message
          return callback(errMsg)
        } else {
          //Create testResultsHtmlPath
          fs.mkdir(testResultsHtmlPath, { recursive: true }, function resultOfMkdirp(err) {
            if (err) {
              errMsg = "Oops, got an error trying to create the following test results html directory path '" + testResultsHtmlPath + "': " + err.message
              return callback(errMsg)
            } else {
              eachLimit(xRunObject.postmanCollections, limitConcurrency, function iterateOverObject(item, callback) {
                runPostmanCollection(item, testResultsHtmlPath, function resultOfRunPostmanCollection(errMsg, collectionResults) {
                  if (errMsg) {
                    return callback(errMsg)
                  } else {
                    collectionCompleteCounter++
            
                    if (collectionResults.collectionResult === 'failed') {
                      collectionFailCounter++
                    }
            
                    //Tally data from collectionResults for testResultSummary
                    tallyTestsTotal += collectionResults.testsTotal
                    tallyTestsFailed += collectionResults.testsFailed
                    tallyTestsPassed += collectionResults.testsPassed
                    tallyAssertionsTotal += collectionResults.assertionsTotal
                    tallyAssertionsFailed += collectionResults.assertionsFailed
                    tallyAssertionsPassed += collectionResults.assertionsPassed

                    testResultSummary['collectionResults'].push(collectionResults)
                    printCommandLineTestResult(collectionCompleteCounter, collectionResults, commandLine)
            
                    return callback(null)
                  }
                })
              }, function resultOfEachOfLimit(errMsg) {
                 if (errMsg) {
                    return callback(errMsg)
                 } else {
                   //Set testEndTime
                   testEndTime = time.inSeconds()
            
                   //Get totalTestDuration
                   totalTestDuration = time.differenceReadableFormat(testStartTime, testEndTime)

                   if (collectionFailCounter > 0) {
                     testFinalResult = 'FAILED'
                   } else {
                     testFinalResult = 'PASSED'
                   }
            
                   //Set final testResultSummary properties
                   testResultSummary['dateTimeOfRunPrintable'] = dateTimeOfRunPrintable
                   testResultSummary['tallyTestsTotal'] = tallyTestsTotal
                   testResultSummary['tallyTestsTotalPrintable'] = tallyTestsTotal.numberWithCommas()
                   testResultSummary['tallyTestsFailed'] = tallyTestsFailed
                   testResultSummary['tallyTestsFailedPrintable'] = tallyTestsFailed.numberWithCommas()
                   testResultSummary['tallyTestsPassed'] = tallyTestsPassed
                   testResultSummary['tallyTestsPassedPrintable'] = tallyTestsPassed.numberWithCommas()
                   testResultSummary['tallyAssertionsTotal'] = tallyAssertionsTotal
                   testResultSummary['tallyAssertionsTotalPrintable'] = tallyAssertionsTotal.numberWithCommas()
                   testResultSummary['tallyAssertionsFailed'] = tallyAssertionsFailed
                   testResultSummary['tallyAssertionsFailedPrintable'] = tallyAssertionsFailed.numberWithCommas()
                   testResultSummary['tallyAssertionsPassed'] = tallyAssertionsPassed
                   testResultSummary['tallyAssertionsPassedPrintable'] = tallyAssertionsPassed.numberWithCommas()
                   testResultSummary['collectionsTotal'] = collectionCompleteCounter
                   testResultSummary['collectionsTotalPrintable'] = collectionCompleteCounter.numberWithCommas()
                   testResultSummary['collectionsFailed'] = collectionFailCounter
                   testResultSummary['collectionsFailedPrintable'] = collectionFailCounter.numberWithCommas()
                   testResultSummary['collectionsPassed'] = (collectionCompleteCounter - collectionFailCounter)
                   testResultSummary['collectionsPassedPrintable'] = testResultSummary['collectionsPassed'].numberWithCommas()
                   testResultSummary['testDurationTotalPrintable'] = totalTestDuration
                   testResultSummary['testFinalResult'] = testFinalResult
            
                   printCommandLineFooter(testResultSummary, commandLine)
            
            
                   createSummaryHtml(testResultSummary, testResultsHtmlPath, function resultOfCreateSummaryHtml(errMsg) {
                     if (errMsg) {
                       return callback(errMsg)
                     } else {
                       uploadTestResultsToWebserver(testResultsHtmlPath, function resultOfUpload(testResultsUrl) {
                         sendSummaryResultsToSlack(testResultSummary, testResultsUrl, function resultOfSlack() {
                           return callback(null, testFinalResult)
                         })
                       })
                     }
                   })
            
                 }
              })
            }
          })
        }
      })
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.createXRunObject = function createXRunObject(directoryList, callback) {
    const xRunObject = {}
    const environmentType = self.settings.environmentType
    var xRunCollectionObject = {}
    var errMsg = ''


    //Initialize xRunObject['postmanCollections']
    xRunObject['postmanCollections'] = []

    //Check directoryList has at least one item
    if (directoryList.length < 1) {
      errMsg = "Oops, need at least one directory specified within 'directoryList'."
      return callback(errMsg)
    }

    //Initialize postmanGlobalVariableObject
    const postmanGlobalVariableObject = initializePostmanVariableObject('globals')

    //Initialize postmanEnvironmentVariableObject
    const postmanEnvironmentVariableObject = initializePostmanVariableObject('environment')

    //Populate postmanGlobalVariableObject and postmanEnvironmentVariableObject
    populateAllVariables(postmanGlobalVariableObject, postmanEnvironmentVariableObject, directoryList, environmentType, function resultOfPopulateAllVariables(errMsg) {
      if (errMsg) {
        return callback(errMsg)
      } else {
        loadAllPostmanFilesToObject(directoryList, function resultOfLoadAllPostmanFiles(errMsg, postmanFilesObject) {
          if (errMsg) {
            return callback(errMsg)
          } else {
            //Set xRunCollectionObject for directory
            Object.keys(postmanFilesObject).forEach(function resultOfPostmanObject(directory) {
              Object.keys(postmanFilesObject[directory]).forEach(function resultOfPostmanObject(file) {
                if (file.getPostmanFileType() === 'postman_collection') {
                  xRunCollectionObject = {}

                  xRunCollectionObject['globalVariables'] = postmanGlobalVariableObject
                  xRunCollectionObject['environmentVariables'] = postmanEnvironmentVariableObject
                  xRunCollectionObject['directoryName'] = path.basename(directory)
                  xRunCollectionObject['collection'] = postmanFilesObject[directory][file]

                  //Add xRunCollectionObject to xRunObject
                  xRunObject['postmanCollections'].push(xRunCollectionObject)
                } else {
                  errMsg = "Oops, invalid file type found in 'postmanFilesObject' for directory '" + directory + "': " + file
                  return callback(errMsg)
                }
              })
            })

            return callback(null, xRunObject)
          }
        })
      }
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.getCollectionInfo = function getCI(xRunObject, callback) {
    const collectionInfoObject = {}
    var collectionInfoString = ''
    var directoryName = ''
    var collectionName = ''
    var truncatedCollectionName = ''
    var collectionCounter = 0
    var collectionTestCount = 0

    //Set collectionInfoString header
    collectionInfoString = '__________________________________________________________________________________________________________________________________' + EOL +
                           '                                                                                                                                  ' + EOL +
                           '                                               Collection List (sorted first by Directory Name then Collection Name)' + EOL +
                           '__________________________________________________________________________________________________________________________________' + EOL +
                           'projectName: ' + self.settings.projectName + EOL +
                           'suiteId: ' + self.settings.suiteId + EOL + EOL +
                           'Col # Collection Name                                                                        Tests  Directory Name                ' + EOL +
                           '_____ _____________________________________________________________________________________ _______ ______________________________' + EOL


    //Set collectionInfoObject
    xRunObject.postmanCollections.forEach(function (postmanCollection) {
      directoryName = postmanCollection.directoryName
      collectionName = postmanCollection.collection.info.name
      collectionTestCount = postmanCollection.collection.item.length

      //Initialize collectionInfoObject[directoryName]
      if (! collectionInfoObject.hasOwnProperty(directoryName)) {
        collectionInfoObject[directoryName] = {}
      }

      //Set collectionInfoObject[directoryName][collectionName]
      collectionInfoObject[directoryName][collectionName] = collectionTestCount
    })

    //Loop over collectionInfoObject in sorted manner
    Object.keys(collectionInfoObject).sort(insensitive).forEach(function (directoryName) {
      Object.keys(collectionInfoObject[directoryName]).sort(insensitive).forEach(function (collectionName) {
        //Increment collectionCounter
        collectionCounter++

        truncatedCollectionName = collectionName.substring(0, 85)

        //Set collectionInfoString
        collectionInfoString += collectionCounter.toString().padStart(5, ' ') + ' ' +
                                truncatedCollectionName.padEnd(85, ' ') + ' ' +
                                collectionInfoObject[directoryName][collectionName].toString().padStart(7, ' ') + ' ' +
                                directoryName + EOL
      })
    })

    collectionInfoString += '__________________________________________________________________________________________________________________________________' + EOL

    return callback(null, collectionInfoObject, collectionInfoString)
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.filterXRunObjectFromCollectionList = function resultOfFilter(xRunObject, collectionCSVList, callback) {
    var errMsg = ''
    var collectionList = collectionCSVList.replace(/\s/g,'').split(',')
    var collectionFoundFlag = false
    var notFoundCollectionList = []
    var collectionIndex = 0

    //First confirm that each collection in collectionList exists in xRunObject
    collectionList.forEach(function (collectionName) {
      //Reset collectionFoundFlag
      collectionFoundFlag = false

      xRunObject.postmanCollections.forEach(function (postmanCollection) {
        if (postmanCollection.collection.info.name === collectionName) {
          collectionFoundFlag = true
        }
      })

      if (collectionFoundFlag === false) {
        notFoundCollectionList.push(collectionName)
      }
    })

    //Return error for any collections not found
    if (notFoundCollectionList.length > 0) {
      errMsg = "Oops, the following provided collections were not found within the provided suiteId: " + notFoundCollectionList.toString()
      return callback(errMsg)
    }

    //Remove all collections in xRunObject not provided within collectionList (iterate in reverse to delete array items)
    collectionIndex = xRunObject.postmanCollections.length
    while (collectionIndex--) {
      //Reset collectionFoundFlag
      collectionFoundFlag = false

      collectionList.forEach(function (collectionName) {
        if (xRunObject.postmanCollections[collectionIndex].collection.info.name === collectionName) {
          collectionFoundFlag = true
        }
      })

      //If collection not found delete from xRunObject
      if (collectionFoundFlag === false) {
        xRunObject.postmanCollections.splice(collectionIndex, 1)
      }
    }

    return callback(null, xRunObject)
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function insensitive(s1, s2) {
    var s1lower = s1.toLowerCase()
    var s2lower = s2.toLowerCase()

    return s1lower > s2lower? 1 : (s1lower < s2lower? -1 : 0)
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function populateAllVariables(postmanGlobalVariableObject, postmanEnvironmentVariableObject, directoryList, environmentType, callback) {

    //First populate all global variables
    populateGlobalVariables(postmanGlobalVariableObject, function resultOfPopulateGlobalVariables(errMsg) {
      if (errMsg) {
        return callback(errMsg)
      } else {
        //Needed for apihub
        populateVersionToEnvironmentVariables(postmanEnvironmentVariableObject, directoryList, function resultOfPopulateVersionToEnvironmentVariables(errMsg) {
          if (errMsg) {
            return callback(errMsg)
          } else {
            populateEnvironmentVariables(postmanEnvironmentVariableObject, directoryList, environmentType, function resultOfPopulateEnvironmentVariables(errMsg) {
              if (errMsg) {
                return callback(errMsg)
              } else {
                return callback(null)
              }
            })
          }
        })
      }
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function populateGlobalVariables(postmanGlobalVariableObject, callback) {
    var globalVariablesPath = path.join(__dirname, '../', 'variables', 'global-variables.bulk')

    //Populate global variables
    fs.readFile(globalVariablesPath, function resultOfReadGlobalVariablesPath(err, data) {
      if (err) {
        const errMsg = "Oops, unable to read global variables file '" + globalVariablesPath + "' due to the following: " + err.message
        return callback(errMsg)
      } else {
        //Populate global bulk variables
        populateBulkVariables(data, postmanGlobalVariableObject)

        return callback(null)
      }
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //This is a special function specifically for apihub
  //////////////////////////////////////////////////////////////////////////////
  function populateVersionToEnvironmentVariables(postmanEnvironmentVariableObject, directoryList, callback) {
    var errMsg = ''
    var packageJsonPath = ''
    var packageJson = {}
    var directoryCount = directoryList.length
    var directoryCounter = 0
    var versionKey = ''
    var versionValue = ''

    //Loop over directoryList
    directoryList.forEach(function resultOfArrayDirectory(directory) {

      //Check if package.json exists, if it does add version variable to postmanEnvironmentVariableObject
      packageJsonPath = path.join(directory, '../', '../', '../', 'package.json')

      //Attempt to read packageJsonPath
      fs.readFile(packageJsonPath, function resultOfReadPackageJsonPath(err, data) {
        if (err) {
          //Do nothing
        } else {
          //Parse to packageJson
          try {
            packageJson = JSON.parse(data.toString())
          } catch (err) {
            errMsg = "Oops, error converting package json file '" + packageJsonPath + "' to object: " + err.message
            return callback(errMsg)
          }

          //Add version variable
          versionKey = packageJson.name + '-version'
          versionValue = packageJson.version
          addPostmanVariable(postmanEnvironmentVariableObject, versionKey, versionValue)
        }

        directoryCounter++

        //All done
        if (directoryCounter === directoryCount) {
          return callback(null)
        }
      })
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function populateEnvironmentVariables(postmanEnvironmentVariableObject, directoryList, environmentType, callback) {
    var directoryCount = 0
    var directoryCounter = 0
    var potentialEnvironmentVariableBulkFilePath = ''
    var potentialEnvironmentVariableBulkFileList = {}

    directoryList.forEach(function resultOfArrayDirectory(directory) {
      //Check environment bulk files from xrun directory
      potentialEnvironmentVariableBulkFilePath = path.join(directory, '../xrun/', environmentType + '.bulk')
      potentialEnvironmentVariableBulkFileList[potentialEnvironmentVariableBulkFilePath] = '1'

      //Check environment bulk files within directory
      potentialEnvironmentVariableBulkFilePath = path.join(directory, environmentType + '.bulk')
      potentialEnvironmentVariableBulkFileList[potentialEnvironmentVariableBulkFilePath] = '1'
    })

    //Set directoryCount
    directoryCount = Object.keys(potentialEnvironmentVariableBulkFileList).length

    //Loop over potentialEnvironmentVariableBulkFileList and read all possible locations of env .bulk file
    Object.keys(potentialEnvironmentVariableBulkFileList).forEach(function resultOf(potentialEnvironmentVariableBulkFilePath) {
      //Attempt to read local bulk variables
      fs.readFile(potentialEnvironmentVariableBulkFilePath, function resultOfReadLocalVariablesPath(err, data) {
        if (err) {
          //Do nothing
        } else {
          //Populate local bulk variables
          populateBulkVariables(data, postmanEnvironmentVariableObject)
        }

        directoryCounter++

        //All done
        if (directoryCounter === directoryCount) {
          return callback(null)
        }
      })
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function populateBulkVariables(data, postmanVariableObject) {
    var bulkData = data.toString('utf-8')
    var lineArray = bulkData.split(/\r\n|\r|\n/)
    var keyValueString = ''
    var strPos1 = 0
    var key = ''
    var value = ''

    lineArray.forEach(function(line) {
      keyValueString = line.trim()

      if (keyValueString.length > 0) {
        strPos1 = keyValueString.indexOf(':')
        if (strPos1 >= 0) {
          key = keyValueString.substring(0, strPos1)
          value = keyValueString.substring(strPos1 + 1)

          addPostmanVariable(postmanVariableObject, key.trim(), value.trim())
        }
      }
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function loadAllPostmanFilesToObject(directoryList, callback) {
    var postmanFilesObject = {}
    var errMsg = ''
    var directoryCount = directoryList.length
    var directoryCounter = 0
    var postmanColCounter = 0


    //Loop over directoryList
    directoryList.forEach(function resultOfArrayDirectory(directory) {

      //Initialize postmanFilesObject[directory]
      postmanFilesObject[directory] = {}

      getArrayOfFilePathsForDirectory(directory, '.json', function resultOfGetArrayOfFilePaths(errMsg, filePathArray, directoryPath) {
        if (errMsg) {
          return callback(errMsg)
        } else {
          //Reset
          postmanColCounter = 0

          filePathArray.forEach(function resultOfArrayFile(filePath) {
            if (filePath.getPostmanFileType() === 'postman_collection') {
              postmanColCounter++

              //Add to postmanFilesObject[directoryPath]
              postmanFilesObject[directoryPath][path.basename(filePath)] = {}
            } else {
              //Not a postman_collection type file
            }
          })

          if (postmanColCounter === 0) {
            errMsg = "Oops, at least one 'postman_collection' file is required per directory. Did not find any within: " + directoryPath
            return callback(errMsg)
          }

          directoryCounter++

          //Done looping through directories
          if (directoryCounter === directoryCount) {
            readAllPostmanFilesToObject(postmanFilesObject, function resultOfReadAllPostmanFilesToObject(errMsg) {
              if (errMsg) {
                return callback(errMsg)
              } else {
                //All done
                return callback(null, postmanFilesObject)
              }
            })
          }
        }
      })
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function readAllPostmanFilesToObject(postmanFilesObject, callback) {
    var errMsg = ''
    var totalFileCount = 0
    var totalFileCounter = 0

    //Get totalFileCount
    Object.keys(postmanFilesObject).forEach(function resultOfPostmanObject(directory) {
      Object.keys(postmanFilesObject[directory]).forEach(function resultOfPostmanObject(file) {
        totalFileCount++
      })
    })

    //Read all files
    Object.keys(postmanFilesObject).forEach(function resultOfPostmanObject(directory) {
      Object.keys(postmanFilesObject[directory]).forEach(function resultOfPostmanObject(file) {
        readPostmanFile(directory, file, function resultOfReadAllPostmanFile(errMsg, postmanObject, fileExists, directoryPath, fileName) {
          if (errMsg) {
            return callback(errMsg)
          } else {
            postmanFilesObject[directoryPath][fileName] = postmanObject

            totalFileCounter++

            if (totalFileCounter === totalFileCount) {
              return callback(null)
            }
          }
        })
      })
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function runPostmanCollection(postmanCollection, testResultsHtmlPath, callback) {
    const options = constructPostmanOptions(postmanCollection)

    newman.run(options, function (err, summary) {
      if (err) {
        const errMsg = "Oops, newman run resulted in the following error: " + err.stack
        return callback(errMsg)
      } else {
        const collectionResults = constructCollectionResults(postmanCollection, summary)

        //Create collection html report
        createCollectionHtmlReport(testResultsHtmlPath, collectionResults, function (errMsg) {
          if (errMsg) {
            return callback(errMsg)
          } else {
            return callback(null, collectionResults)
          }
        })
      }
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function createCollectionHtmlReport(testResultsHtmlPath, collectionResults, callback) {
    const collectionHtmlPath = path.join(testResultsHtmlPath, collectionResults.collectionName + '.html')
    const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')

    //Add helpers
    handlebars.registerHelper("increment", function(value, options) {
      return parseInt(value) + 1
    })

    handlebars.registerHelper("uriencode", function(value, options) {
      return encodeURIComponent(value)
    })

    handlebars.registerHelper('compareStrings', function(p, q, options) {
      return (p == q) ? options.fn(this) : options.inverse(this);
    })

    //DEBUG: https://gist.github.com/karlwestin/3487951
    //Put {{log 0 item}} anywhere in template to print out 'item'
    handlebars.logger.log = function(level) {
      if(level >= handlebars.logger.level) {
        //console.log.apply(console, [].concat(["Handlebars: "], _.toArray(arguments)));
        console.log.apply(console, arguments)
      }
    }
    handlebars.registerHelper('log', handlebars.logger.log)
    // Std level is 3, when set to 0, handlebars will log all compilation results
    handlebars.logger.level = 0

    //Read collectionTemplatePath
    fs.readFile(collectionTemplatePath, function resultOfReadCollectionTemplatePath(err, data) {
      if (err) {
        let errMsg = "Oops, unable to read collection template file '" + collectionTemplatePath + "' due to the following: " + err.message
        return callback(errMsg)
      } else {
        const collectionTemplate = data.toString()

        //preventIndent = true prevents indentation within partials (e.g. prevents unwanted indenting in <pre></pre> tags within partials)
        //https://github.com/handlebars-lang/handlebars.js/issues/858
        const template = handlebars.compile(collectionTemplate, {noEscape: true, preventIndent: true})
        const collectionHtmlResult = template(collectionResults)

        fs.writeFile(collectionHtmlPath, collectionHtmlResult, function resultOfWriteHtmlSummary(err) {
          if (err) {
            let errMsg = "Oops, unable to write html collection to '" + collectionHtmlPath + "' due to the following: " + err.message
            return callback(errMsg)
          } else {
            return callback(null)
          }
        })
      }
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function constructPostmanOptions(postmanCollection) {
    const options = {}

    //Set options for newman.run
    //options['reporters'] = []
    //options['reporter'] = {}
    options['collection'] = postmanCollection.collection
    options['globals'] = postmanCollection.globalVariables
    options['environment'] = postmanCollection.environmentVariables
    options['timeout'] = self.settings.timeoutCollection
    options['timeoutRequest'] = self.settings.timeoutRequest
    options['timeoutScript'] = self.settings.timeoutScript
    options['ignoreRedirects'] = self.settings.ignoreRedirects

    //Set reporters
    //HTML requires a dependency, let's create internally instead
    //options['reporters'].push('html')
    //options['reporter']['html'] = { export : path.join(testResultsBasePath, 'html', collectionName + '.html'), template: path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs') }
    
    //Everything in json is already available in internal summary object
    //options['reporters'].push('json')
    //options['reporter']['json'] = {}
    //options['reporter']['json']['export'] = path.join(testResultsBasePath, 'json', collectionName + '.json')

    return options
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function constructCollectionResults(postmanCollection, summary) {
    const collectionResults = {}

    //console.log("DEBUG: postmanCollection: " + JSON.stringify(postmanCollection, null, 2))
    //console.log("DEBUG: summary.collection: " + JSON.stringify(summary.collection, null, 5))
    //console.log("DEBUG: summary.run.executions: " + JSON.stringify(summary.run.executions, null, 5))

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
    collectionResults.xRunVersion = version

    //Steps
    collectionResults.steps = []
    Object.keys(summary.run.executions).forEach(function (index) {
      const item = summary.run.executions[index]
      const postmanRequestUrlObject = convertToCleanObject(item.request.url)
      const postmanRequestHeadersObject = convertToCleanObject(item.request.headers)
      const postmanResponseHeadersObject = convertToCleanObject(item.response.headers)
      const contentTypeRequest = getHeaderValue(postmanRequestHeadersObject, 'Content-Type')
      const contentTypeResponse = getHeaderValue(postmanResponseHeadersObject, 'Content-Type')
      const postmanAssertions = convertToCleanObject(item.assertions)
      const stepItem = {}

      //TODO: Check for testScript errors and report on them if/when they occur. Example below
      /*
          "testScript": [
                {
                    "error": {
                          "type": "Error",
                          "name": "ReferenceError",
                          "message": "startXTest is not defined",
                          "checksum": "3f30a68f629f26433a11bd12b148e111",
                          "id": "8991769f-d50e-4d33-85e1-2abbcc6cf6bf",
                          "timestamp": 1672877478616,
                          "stacktrace": []
                    }
                }
          ]
      */

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
      stepItem.response.code = item.response.code
      stepItem.response.status = item.response.status
      stepItem.response.headers = cleanupPostmanHeaders(postmanResponseHeadersObject)
      stepItem.response.headersHtml = escapeAndFormatHtml(convertHeadersToString(stepItem.response.headers), 'properties')
      stepItem.response.body = constructPostmanBody(item.response.stream)
      stepItem.response.bodyHtmlEscaped = escapeAndFormatHtml(stepItem.response.body, contentTypeResponse)
      stepItem.response.responseSize = item.response.responseSize
      stepItem.response.responseTime = item.response.responseTime

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
    collectionResults.testsTotalPrintable = collectionResults.testsTotal.numberWithCommas()
    collectionResults.testsFailed = collectionResults.stepsFailed
    collectionResults.testsFailedPrintable = collectionResults.testsFailed.numberWithCommas()
    collectionResults.testsPassed = collectionResults.stepsPassed
    collectionResults.testsPassedPrintable = collectionResults.testsPassed.numberWithCommas()

    //Assertions stats
    collectionResults.assertionsTotal = summary.run.stats.assertions.total
    collectionResults.assertionsTotalPrintable = collectionResults.assertionsTotal.numberWithCommas()
    collectionResults.assertionsFailed = summary.run.stats.assertions.failed
    collectionResults.assertionsFailedPrintable = collectionResults.assertionsFailed.numberWithCommas()
    collectionResults.assertionsPassed = (collectionResults.assertionsTotal - collectionResults.assertionsFailed)
    collectionResults.assertionsPassedPrintable = collectionResults.assertionsPassed.numberWithCommas()

    if ( (collectionResults.assertionsFailed > 0) || (collectionResults.assertionsPassed === 0) ) {
      collectionResults.collectionResult = 'failed'
      collectionResults.collectionPassed = false
    } else {
      collectionResults.collectionResult = 'passed'
      collectionResults.collectionPassed = true
    }

    return collectionResults



    function escapeAndFormatHtml(inputString, contentType) {
      var outputString = ""
      loadLanguages(['xml', 'json', 'properties'])


      if (inputString == null) {
        outputString = inputString
      } else {

        if (contentType != null) {
          const jsonTest = new RegExp('application\/json', 'i')
          const xmlTest = new RegExp('application\/xml', 'i')
          
          if (jsonTest.test(contentType)) {
            outputString = prism.highlight(inputString, prism.languages.json, 'json')
            //outputString = escapeHtml(inputString)
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


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function getDateTime() {
    const now = new Date()

    const year = now.getFullYear()
    const month = ("0" + (now.getMonth() + 1)).slice(-2)
    const day = ("0" + now.getDate()).slice(-2)

    const hour = ("0" + now.getHours()).slice(-2)
    const minute = ("0" + now.getMinutes()).slice(-2)
    const second = ("0" + now.getSeconds()).slice(-2)

    // YYYY-MM-DD hh:mm:ss
    const formatted = `${year}-${month}-${day} ${hour}:${minute}:${second}`

    return formatted
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function initializePostmanVariableObject(variableType) {
    var name = ''
    var postmanVariableScope = ''
    var basePostmanVariableObject = {}

    //Set values based on variableType
    if (variableType === 'environment') {
      name = 'xRun Environment Variables'
      postmanVariableScope = 'environment'
    } else if (variableType === 'globals') {
      name = 'xRun Global Variables'
      postmanVariableScope = 'environment'
    }

    //Set properties
    basePostmanVariableObject["id"] = "24fc854b-bd95-4ea9-b64e-6b5c85ebdbcc"
    basePostmanVariableObject["name"] = name
    basePostmanVariableObject["values"] = []
    basePostmanVariableObject["timestamp"] = 1489171700473
    basePostmanVariableObject["_postman_variable_scope"] = postmanVariableScope
    basePostmanVariableObject["_postman_exported_at"] = "2017-09-05T22:03:25.433Z"
    basePostmanVariableObject["_postman_exported_using"] = "Postman/5.2.0"

    return basePostmanVariableObject
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function addPostmanVariable(postmanVariableObject, key, value) {
    var keyValueObject = {}

    keyValueObject["enabled"] = true
    keyValueObject["key"] = key
    keyValueObject["value"] =  value
    keyValueObject["type"] = "text"

    postmanVariableObject.values.push(keyValueObject)
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function createSummaryHtml(testResultSummary, testResultsHtmlPath, callback) {
    const autoOpenTestResultHtml = self.settings.autoOpenTestResultHtml
    const summaryHtmlPath = path.join(testResultsHtmlPath, 'summary.html')
    const summaryTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-summary.hbs')

    //Add helpers
    handlebars.registerHelper("increment", function(value, options) {
      return parseInt(value) + 1
    })

    handlebars.registerHelper("uriencode", function(value, options) {
      return encodeURIComponent(value)
    })

    handlebars.registerHelper('compareStrings', function(p, q, options) {
      return (p == q) ? options.fn(this) : options.inverse(this);
    })

    //Read summaryTemplatePath
    fs.readFile(summaryTemplatePath, function resultOfReadSummaryTemplatePath(err, data) {
      if (err) {
        let errMsg = "Oops, unable to read summary template file '" + summaryTemplatePath + "' due to the following: " + err.message
        return callback(errMsg)
      } else {
        const summaryTemplate = data.toString()

        const template = handlebars.compile(summaryTemplate)
        const summaryHtmlResult = template(testResultSummary)

        fs.writeFile(summaryHtmlPath, summaryHtmlResult, function resultOfWriteHtmlSummary(err) {
          if (err) {
            let errMsg = "Oops, unable to write html summary to '" + summaryHtmlPath + "' due to the following: " + err.message
            return callback(errMsg)
          } else {
            if (autoOpenTestResultHtml === true) {
              open(summaryHtmlPath)
            }

            return callback(null)
          }
        })
      }
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function uploadTestResultsToWebserver(testResultsHtmlPath, callback) {
    const zip = new admzip()
    const zipFileName = 'xrun-test-results.zip'
    const zipFilePath = path.join(testResultsHtmlPath, zipFileName)
    const requestJsonObject = {}
    const request = {}

    if (self.settings.uploadTestResultsToWebserver === true) {
      process.stdout.write("Uploading test results to webserver...")

      //Zip testResultsHtmlPath to zipFilePath
      zip.addLocalFolder(testResultsHtmlPath)
      zip.writeZip(zipFilePath)

      //Read zipFilePath
      fs.readFile(zipFilePath, function resultOfReadZipFile(err, data) {
        if (err) {
          let errMsg = "Oops, got the following error reading zipFilePath '" + zipFilePath + "': " + err.message
          console.log(errMsg)
          return callback(null)
        } else {
          //Set requestJsonObject
          requestJsonObject['fileName'] = zipFileName
          requestJsonObject['fileType'] = '.zip'
          requestJsonObject['fileData'] = data.toString('base64')
          requestJsonObject['numberOfDaysToKeep'] = self.settings.numberOfDaysToKeepTestResultsOnWebserver

          //Set request
          request['url'] = self.settings['apihubBaseUrl'] + '/v1/static/upload'
          request['method'] = 'POST'
          request['headers'] = { "Content-Type": "application/json", "apihub-token": self.settings['apihubToken']}
          request['body'] = JSON.stringify(requestJsonObject, null, 2)
          request['timeout'] = 600000


          httpClient(request, function resultOfHttpMonitorRequest(errMsg, response) {
            if (errMsg) {
              console.log(errMsg)
              return callback(null)
            } else {
              if (response.statusCode === 200) {
                //Parse out response.httpClientResponseBody
                try {
                  responseJsonObject = JSON.parse(response.httpClientResponseBody)
                } catch (e) {
                  console.log("Oops, got http status code response '" + response.statusCode + "' but unable to parse response body: " + response.httpClientResponseBody)
                  return callback(null)
                }

                let testResultsUrl = responseJsonObject['baseUrl'] + '/summary.html'
                console.log("success!")
                console.log("Test Results: " + testResultsUrl)
                return callback(testResultsUrl)
              } else {
                try {
                  responseJsonObject = JSON.parse(response.httpClientResponseBody)
                  console.log("Oops, got http status code response '" + response.statusCode + "' and error response: " + responseJsonObject.errorMessage)
                  return callback(null)
                } catch (e) {
                  console.log("Oops, got http status code response '" + response.statusCode + "' and unable to parse response body: " + response.httpClientResponseBody)
                  return callback(null)
                }
              }
            }
          })
        }
      })
    } else {
      return callback(null)
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function sendSummaryResultsToSlack(testResultSummary, testResultsUrl, callback) {
    const slack = new Slack(self.settings.slackToken)
    const localMachineNameShort = hostname.short()
    const pathLocation = path.join(__dirname, '../')
    var slackIcon = ''
    var slackUser = ''
    var testResultsLink = 'Not Available'
    var hardAlertFlag = false
    var slackTextPrefix = ''
    const slackObject = {}

    if (self.settings.sendSummaryResultsToSlack === true) {
      process.stdout.write("Sending summary results to slack...")

      if (testResultSummary['testFinalResult'] === 'PASSED') {
        slackIcon = self.settings.slackIconTestsPass
        slackUser = self.settings.projectName + '-' + self.settings.suiteId + ' - PASSED'

        if (self.settings.slackHardAlertOnSuccess === true) {
          hardAlertFlag = true
        } else {
          hardAlertFlag = false
        }
      } else {
        slackIcon = self.settings.slackIconTestsFail
        slackUser = self.settings.projectName + '-' + self.settings.suiteId + ' - FAILED'

        if (self.settings.slackHardAlertOnFailure === true) {
          hardAlertFlag = true
        } else {
          hardAlertFlag = false
        }
      }

      //Set testResultsLink
      if (testResultsUrl) {
        testResultsLink = "<" + testResultsUrl + "|Click Here>"
      }


      //https://api.slack.com/reference/surfaces/formatting#special-mentions
      if (hardAlertFlag === true) {
        slackTextPrefix = '<!channel> '
      } else {
        slackTextPrefix = ''
      }

      //Set requestJsonObject
      slackObject['text'] = slackTextPrefix + "Greetings from " + localMachineNameShort + ":" + pathLocation + ". Here are my automated test results:\n\n*Project Name:* " + self.settings.projectName + "\n*Suite ID:* " + self.settings.suiteId + "\n*Environment Type:* " + self.settings.environmentType + "\n*Concurrency Limit:* " + self.settings.limitConcurrency + "\n*Total Collections:* " + testResultSummary['collectionsTotalPrintable'] + ", *Collections Passed:* " + testResultSummary['collectionsPassedPrintable'] + ", *Collections Failed:* " + testResultSummary['collectionsFailedPrintable'] + "\n*Total Assertions:* " + testResultSummary['tallyAssertionsTotalPrintable'] + ", *Assertions Passed:* " + testResultSummary['tallyAssertionsPassedPrintable'] + ", *Assertions Failed:* " + testResultSummary['tallyAssertionsFailedPrintable'] + "\n*Run Time:* " + testResultSummary['testDurationTotalPrintable'] + "\n*Test Results:* " + testResultsLink
      slackObject['icon_emoji'] = slackIcon
      slackObject['channel'] = self.settings.slackChannel
      slackObject['username'] = slackUser


      slack.postMessage(slackObject, function resultOfPostMessage(errMsg) {
        if (errMsg) {
          return callback(errMsg)
        } else {
          console.log("success!")
          return callback(null)
        }
      })
    } else {
      return callback(null)
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  String.prototype.getPostmanFileType = function getPFT() {
    var postmanFileName = this
    var fileType = ''
    var strPos1 = 0

    //Format is: {filename}.{filetype}.json

    postmanFileName = path.basename(postmanFileName.toString(), '.json')
    strPos1 = postmanFileName.lastIndexOf('.')
    if (strPos1 > 0) {
      fileType = postmanFileName.substring(strPos1 + 1)
    }

    return fileType
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  String.prototype.replaceSpecialChars = function replaceSC() {
    var replacedString = this

    replacedString = replacedString.replace(/\\/g, '-')
    replacedString = replacedString.replace(/\//g, '-')

    return replacedString
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  String.prototype.padStart = function padS(l, c) {
    return Array(l - this.length + 1).join(c||" ") + this
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  String.prototype.padEnd = function padE(l, c) {
    return this + Array(l - this.length + 1).join(c||" ")
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function printCommandLineHeader(xRunObject, commandLine) {
    var line = ''

    if (commandLine === true) {
      line = EOL +
             '__________________________________________________________________________________________________________________________________________________________________________' + EOL + EOL +
             '                                                                       xRun Version ' + version + EOL +
             '__________________________________________________________________________________________________________________________________________________________________________' + EOL + EOL +
             'Settings: ' + EOL +
             'Project Name: ' + self.settings.projectName + EOL +
             'Suite ID: ' + self.settings.suiteId + EOL +
             'Total Number of Collections to Run: ' + xRunObject.postmanCollections.length + EOL +
             'Environment Type: ' + self.settings.environmentType + EOL +
             'Concurrency Limit: ' + self.settings.limitConcurrency + EOL +
             'Collection Time Out: ' + self.settings.timeoutCollection + ' ms' + EOL +
             'Request Time Out: ' + self.settings.timeoutRequest + ' ms' + EOL +
             'Script Time Out: ' + self.settings.timeoutScript + ' ms' + EOL +
             '__________________________________________________________________________________________________________________________________________________________________________' + EOL +
             '                                                                                                                                                                          ' + EOL +
             'Results Overview:                                                                                                                                                         ' + EOL +
             '__________________________________________________________________________________________________________________________________________________________________________' + EOL +
             '                                                                                             Col Run   Total   Tests   Tests    Total     Assertions  Assertions   Col    ' + EOL +
             'Col # Collection Name                                                                         Time     Tests   Pass    Fail   Assertions     Pass        Fail     Result  ' + EOL +
             '----- ------------------------------------------------------------------------------------- --------- ------- ------- ------- ----------- ----------- ----------- ------- ' + EOL

      process.stdout.write(line)
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function printCommandLineTestResult(collectionCompleteCounter, collectionResults, commandLine) {
    var line = ''
    var passedAssertions = 0
    var testResult = ''
    var truncatedCollectionName = ''

    if (commandLine === true) {

      truncatedCollectionName = collectionResults.collectionName.substring(0, 85)

      passedAssertions = (collectionResults.assertionsTotal - collectionResults.assertionsFailed)
      if (collectionResults.collectionResult === 'failed') {
        testResult = colors.red('failed')
      } else {
        testResult = colors.green('passed')
      }

      line = collectionCompleteCounter.toString().padStart(5, ' ') + ' ' +
             truncatedCollectionName.padEnd(85, ' ') +  ' ' +
             collectionResults.executionTimeTotalPrintable.padEnd(9, ' ') + ' ' +
             collectionResults.testsTotalPrintable.padEnd(7, ' ') + ' ' +
             collectionResults.testsPassedPrintable.padEnd(7, ' ') + ' ' +
             collectionResults.testsFailedPrintable.padEnd(7, ' ') + ' ' +
             collectionResults.assertionsTotalPrintable.padEnd(11, ' ') + ' ' +
             collectionResults.assertionsPassedPrintable.padEnd(11, ' ') + ' ' +
             collectionResults.assertionsFailedPrintable.padEnd(11, ' ') + ' ' +
             testResult + EOL

      process.stdout.write(line)
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  Number.prototype.numberWithCommas = function numWithCommas() {
      return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function printCommandLineFooter(testResultSummary, commandLine) {
    var line = ''
    var testFinalResult = ''

    if (commandLine === true) {

      if (testResultSummary.collectionsFailed > 0) {
        testFinalResult = colors.red('FAILED')
      } else {
        testFinalResult = colors.green('PASSED')
      }

      line = '__________________________________________________________________________________________________________________________________________________________________________' + EOL +
             'Summary Stats:' + EOL +
             'Total Collections: ' + testResultSummary.collectionsTotalPrintable + ', Collections Passed: ' + testResultSummary.collectionsPassedPrintable + ', Collections Failed: ' + testResultSummary.collectionsFailedPrintable + EOL +
             'Total Tests: ' + testResultSummary.tallyTestsTotalPrintable + ', Tests Passed: ' + testResultSummary.tallyTestsPassedPrintable + ', Tests Failed: ' + testResultSummary.tallyTestsFailedPrintable + EOL +
             'Total Assertions: ' + testResultSummary.tallyAssertionsTotalPrintable + ', Assertions Passed: ' + testResultSummary.tallyAssertionsPassedPrintable + ', Assertions Failed: ' + testResultSummary.tallyAssertionsFailedPrintable + EOL +
             'Total Run Time: ' + testResultSummary.testDurationTotalPrintable + EOL +
             'Final Result: ' + testFinalResult + EOL +
             '__________________________________________________________________________________________________________________________________________________________________________' + EOL

      process.stdout.write(line)
    }
  }
}

module.exports = xRunLib
