////////////////////////////////////////////////////////////////////////////////
//   getXRunDirectoryPathList.js - Get object of xrun directory absolute paths.  //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const canAccessPath = require('./canAccessPath')
const getFile = require('./getFile')
const getDirectoryNameList = require('./getDirectoryNameList')


////////////////////////////////////////////////////////////////////////////////
// For all directories in xRunProjectPath, returns object with list of:
// a. directy namne as key
// b. directorypath property with absolute path of directory
////////////////////////////////////////////////////////////////////////////////
const getXRunDirectoryPathList = async function getXRunDirectoryPathList(settings, useExcludeList) {
    const directoryPathList = []
    let errMsg = ''
    let data = ''
    let excludeListExists = false
    let excludeList = []
    const xRunDirectoryPath = path.join(settings.xRunProjectPath, settings.xRunProjectDirectoryName)    //Optional
    const excludeListPath = path.join(xRunDirectoryPath, 'exclude-list.json')                           //Optional


    //Ensure we can access xRunProjectPath
    try {
        await canAccessPath(settings.xRunProjectPath)
    } catch (error) {
        errMsg = `Oops, unable to access xRunProjectPath '${settings.xRunProjectPath}' due to ${error.message}`
        throw new Error(errMsg)
    }


    //Check if excludeListExists
    try {
        await canAccessPath(excludeListPath)

        excludeListExists = true
    } catch (error) {
        excludeListExists = false
    }


    //Get excludeList
    if (excludeListExists === true && useExcludeList === true) {
        try {
            data = await getFile(excludeListPath)

            //Parse to excludeList
            excludeList = JSON.parse(data.toString())
        } catch (error) {
            errMsg = `Oops, unable to read '${excludeListPath}' into an array due to ${error.message}`
            throw new Error(errMsg)
        }
    }

    
    try {

        //Force to exclude xRunProjectDirectoryName
        excludeList.push(settings.xRunProjectDirectoryName)

        const tempDirectoryNameList = await getDirectoryNameList(settings.xRunProjectPath)

        //Filter out excludeList from tempDirectoryNameList
        const directoryList = tempDirectoryNameList.filter(item => !excludeList.includes(item))

        if (directoryList.length === 0) {
            errMsg = `Error: Must contain at least one directory.`
            throw new Error(errMsg)
        } else {

            for (directoryName of directoryList) {
                directoryPathList.push(path.join(settings.xRunProjectPath, directoryName))
            }

            return directoryPathList
        }
    } catch (error) {
        errMsg = `Oops, error generating directoryPathsObject from '${settings.xRunProjectPath}': ${error.message}`
        throw new Error(errMsg)
    }
}

module.exports = getXRunDirectoryPathList