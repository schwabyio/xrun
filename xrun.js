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

try {
  const xRunLib = require('./lib/xrun-lib')
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
          const collectionInfoString = await xRun.getPostmanTests(xRun.settings)

          console.log(collectionInfoString)
          process.exit(0)
        } catch (errMsg) {
          console.log(errMsg)
          process.exit(1)
        }
      })()
    } else if (programCommand === 'a' || programCommand === 'all') {
      (async () => {
        try {
          const testFinalResult = await xRun.runAllPostmanTests(xRun.settings)

          if (testFinalResult === 'PASSED') {
            process.exit(0)
          } else {
            process.exit(1)
          }
        } catch (errMsg) {
          console.log(errMsg)
          process.exit(1)
        }
      })()
    } else {
      (async () => {
        try {
          //Set collectionCSVList
          const collectionCSVList = programCommand

          const testFinalResult = await xRun.runCSVPostmanTests(xRun.settings, collectionCSVList)

          if (testFinalResult === 'PASSED') {
            process.exit(0)
          } else {
            process.exit(1)
          }
        } catch (errMsg) {
          console.log(errMsg)
          process.exit(1)
        }
      })()
    }
  }

} catch (error) {
  console.log(`${error.message}`)
  process.exit(1)
}