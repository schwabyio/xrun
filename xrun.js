#!/usr/bin/env node
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  xrun.js - A more awesome way to run Postman tests from the command line.  //
//                                                                            //
//            Created by: schwaby.io                                          //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
'use strict'
//////////////////////////////////
//INITIALIZE DEPENDENT MODULES
//////////////////////////////////
try {
  const xRunLib = require('./lib/xrun-lib')

  //Initialize
  const xRun = new xRunLib()
  const programCommand = process.argv[2] || ''


  if (! programCommand) {
    //Usage
    console.log(xRun.getUsage())
    process.exit(0)
  } else {
    if (programCommand === 'g' || programCommand === 'get') {
      (async () => {
        try {
          let directoryList = await xRun.getDirectoryListAsync(xRun.settings)

          xRun.createXRunObject(directoryList, function resultOfCreateXRunObject(errMsg, xRunObject) {
            if (errMsg) {
              console.log(errMsg)
              process.exit(1)
            } else {
              xRun.getCollectionInfo(xRunObject, function resultOfGetCollectionInfo(errMsg, collectionInfoObject, collectionInfoString) {
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
        } catch (errMsg) {
          console.log(errMsg)
          process.exit(1)
        }
      })()
    } else if (programCommand === 'a' || programCommand === 'all') {
      xRun.getDirectoryList(function resultOfGetDirectoryList(errMsg, directoryList) {
        if (errMsg) {
          console.log(errMsg)
          process.exit(1)
        } else {
          xRun.createXRunObject(directoryList, function resultOfCreatexRunObject(errMsg, xRunObject) {
            if (errMsg) {
              console.log(errMsg)
              process.exit(1)
            } else {
              xRun.run(xRunObject, true, function resultOfRun(errMsg, testFinalResult) {
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

      xRun.getDirectoryList(function resultOfGetDirectoryList(errMsg, directoryList) {
        if (errMsg) {
          console.log(errMsg)
          process.exit(1)
        } else {
          xRun.createXRunObject(directoryList, function resultOfCreatexRunObject(errMsg, xRunObject) {
            if (errMsg) {
              console.log(errMsg)
              process.exit(1)
            } else {
              xRun.filterXRunObjectFromCollectionList(xRunObject, collectionCSVList, function resultOfFilter(errMsg, xRunObject) {
                if (errMsg) {
                  console.log(errMsg)
                  process.exit(1)
                } else {
                  xRun.run(xRunObject, true, function resultOfRun(errMsg, testFinalResult) {
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