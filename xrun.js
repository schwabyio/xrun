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
    (async () => {
      try {
        
        const settingsPath = await xRun.initializeSettingsPath()

        const settings = await xRun.getSettings(settingsPath)

        const usage = await xRun.getUsage()

        console.log(usage)
        process.exit(0)
      } catch (errMsg) {
        console.log(errMsg)
        process.exit(1)
      }
    })()
  } else {
    if (programCommand === 'g' || programCommand === 'get') {
      (async () => {
        try {

          const settingsPath = await xRun.initializeSettingsPath()

          const settings = await xRun.getSettings(settingsPath)

          const collectionInfoString = await xRun.getPostmanTests(settings)

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

          const settingsPath = await xRun.initializeSettingsPath()

          const settings = await xRun.getSettings(settingsPath)

          const testFinalResult = await xRun.runAllPostmanTests(settings)

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

          const settingsPath = await xRun.initializeSettingsPath()

          const settings = await xRun.getSettings(settingsPath)

          //Set collectionCSVList
          const collectionCSVList = programCommand

          const testFinalResult = await xRun.runCSVPostmanTests(settings, collectionCSVList)

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