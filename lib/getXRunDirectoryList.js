////////////////////////////////////////////////////////////////////////////////
//   getXRunDirectoryList.js - Get list of xrun directories.                  //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const canAccessPath = require('./canAccessPath')
const getFile = require('./getFile')
const getDirectories = require('./getDirectories')


////////////////////////////////////////////////////////////////////////////////
// Returns absolute paths of directories in xRunProjectPath
////////////////////////////////////////////////////////////////////////////////
const getXRunDirectoryList = async function getXRunDirectoryList(settings) {
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
    if (excludeListExists) {
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

        const tempDirectoryList = await getDirectories(settings.xRunProjectPath)

        //Filter out excludeList from tempDirectoryList
        const directoryList = tempDirectoryList.filter(item => !excludeList.includes(item))

        if (directoryList.length === 0) {
            errMsg = `Error: Must contain at least one directory.`
            throw new Error(errMsg)
        } else {
            let directoryPathsList = []

            for (directoryName of directoryList) {
                directoryPathsList.push(path.join(settings.xRunProjectPath, directoryName))
            }
            return directoryPathsList
        }
    } catch (error) {
        errMsg = `Oops, got an error generating a directoryList from '${settings.xRunProjectPath}': ${error.message}`
        throw new Error(errMsg)
    }
}

module.exports = getXRunDirectoryList