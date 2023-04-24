////////////////////////////////////////////////////////////////////////////////
//   getXRunDirectoryList.js - Get list of xrun directories.                  //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const canAccessPath = require('./canAccessPath')
const getFile = require('./getFile')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const getXRunDirectoryList = async function getXRunDirectoryList(settings) {
    let errMsg = ''
    let data = ''
    let tempDirectoryList = []
    let directoryList = []
    let suitesDefinitions = {}
    const suitesParentDirectory = 'xrun'

    //Set suitesPath
    const suitesDirectoryPath = path.join(settings.xRunProjectPath, suitesParentDirectory)
    const suitesPath = path.join(suitesDirectoryPath, 'suites.json')

    try {
        await canAccessPath(settings.xRunProjectPath)
    } catch (err) {
        throw err
    }

    try {
        await canAccessPath(suitesDirectoryPath)
    } catch (err) {
        errMsg = `Oops, there must be a directory named '${suitesParentDirectory}' within ${settings.xRunProjectPath} that contains a valid 'suites.json' file.`
        throw new Error(errMsg)
    }

    try {
        data = await getFile(suitesPath)

        //Parse to suitesDefinitions
        suitesDefinitions = JSON.parse(data.toString())

        tempDirectoryList = suitesDefinitions[settings.suiteId]

        if (tempDirectoryList.length === 0) {
            errMsg = "Oops, suiteId '" + settings.suiteId + "' in suites file '" + suitesPath + "' does not contain any directories."
            throw new Error(errMsg)
        } else {
            for (const directory of tempDirectoryList) {
                directoryList.push(path.join(settings.xRunProjectPath, directory))
            }

            return directoryList
        }
    } catch (err) {
        errMsg = "Oops, error converting suites file '" + suitesPath + "' to object: " + err.message
        throw new Error(errMsg)
    }
}

module.exports = getXRunDirectoryList