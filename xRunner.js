#!/usr/bin/env node
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//    xRunner.js - A more awesome way to run Postman tests from the           //
//                 command line.                                              //
//                                                                            //
//                  Created by: schwaby.io                                    //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
'use strict'
//////////////////////////////////
//INITIALIZE DEPENDENT MODULES
//////////////////////////////////
try {
  const xRunnerLib = require('./lib/xrunner-lib')

    //Initialize constants
  const xRunner = new xRunnerLib()
  const programCommand = process.argv[2] || ''


  if (! programCommand) {
    //Usage
    console.log(xRunner.getUsage())
    process.exit(1)
  } else {
    if (programCommand === 'g' || programCommand === 'get') {
      xRunner.getDirectoryList(function resultOfGetDirectoryList(errMsg, directoryList) {
        if (errMsg) {
          console.log(errMsg)
          process.exit(1)
        } else {
          xRunner.createXRunnerObject(directoryList, function resultOfCreateXRunnerObject(errMsg, xRunnerObject) {
            if (errMsg) {
              console.log(errMsg)
              process.exit(1)
            } else {
              xRunner.getCollectionInfo(xRunnerObject, function resultOfGetCollectionInfo(errMsg, collectionInfoObject, collectionInfoString) {
                if (errMsg) {
                  console.log(errMsg)
                  process.exit(1)
                } else {
                  console.log(collectionInfoString)
                  process.exit(0)
                }
              })
            }
          })
        }
      })
    } else if (programCommand === 'a' || programCommand === 'all') {
      xRunner.getDirectoryList(function resultOfGetDirectoryList(errMsg, directoryList) {
        if (errMsg) {
          console.log(errMsg)
          process.exit(1)
        } else {
          xRunner.createXRunnerObject(directoryList, function resultOfCreateXRunnerObject(errMsg, xRunnerObject) {
            if (errMsg) {
              console.log(errMsg)
              process.exit(1)
            } else {
              xRunner.run(xRunnerObject, true, function resultOfRun(errMsg, testFinalResult) {
                if (errMsg) {
                  console.log(errMsg)
                  process.exit(1)
                } else {
                  if (testFinalResult === 'PASSED') {
                    process.exit(0)
                  } else {
                    process.exit(1)
                  }
                }
              })
            }
          })
        }
      })
    } else {
      //Set collectionCSVList
      const collectionCSVList = programCommand

      xRunner.getDirectoryList(function resultOfGetDirectoryList(errMsg, directoryList) {
        if (errMsg) {
          console.log(errMsg)
          process.exit(1)
        } else {
          xRunner.createXRunnerObject(directoryList, function resultOfCreateXRunnerObject(errMsg, xRunnerObject) {
            if (errMsg) {
              console.log(errMsg)
              process.exit(1)
            } else {
              xRunner.filterXRunnerObjectFromCollectionList(xRunnerObject, collectionCSVList, function resultOfFilter(errMsg, xRunnerObject) {
                if (errMsg) {
                  console.log(errMsg)
                  process.exit(1)
                } else {
                  xRunner.run(xRunnerObject, true, function resultOfRun(errMsg, testFinalResult) {
                    if (errMsg) {
                      console.log(errMsg)
                      process.exit(1)
                    } else {
                      if (testFinalResult === 'PASSED') {
                        process.exit(0)
                      } else {
                        process.exit(1)
                      }
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  }

} catch (error) {
  console.log(`${error.message}`)
  process.exit(1)
}