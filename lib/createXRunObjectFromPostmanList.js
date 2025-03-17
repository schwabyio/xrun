////////////////////////////////////////////////////////////////////////////////
//   createXRunObjectFromPostmanList.js - Create an xrun object.              //
//                                                                            //
//   TODO: This will eventually replace createXRunObject.js                   //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const xRunPostmanVariables = require('./xRunPostmanVariables')
const getAllPostmanFilesFromFilePathList = require('./getAllPostmanFilesFromFilePathList')
const getXtestVersion = require('./getXtestVersion')



////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const createXRunObjectFromPostmanList = async function createXRunObjectFromPostmanList(settings, postmanFilePathList) {
    const xRunObject = {}
    const xRunProjectPath = settings.xRunProjectPath
    const environmentType = settings.environmentType
    const xRunVariables = new xRunPostmanVariables()
    const globalVariablesPath = xRunVariables.getGlobalVariablesPath()
    const postmanGlobalVariableObject = xRunVariables.initializePostmanVariableObject('globals')
    const postmanEnvironmentVariableObject = xRunVariables.initializePostmanVariableObject('environment')

    //Initialize
    xRunObject['postmanCollections'] = []

    try {
        //Get and set xtestVersion
        xRunObject['xtestVersion'] = await getXtestVersion(globalVariablesPath)

        await xRunVariables.populateAllVariables(globalVariablesPath, postmanGlobalVariableObject, postmanEnvironmentVariableObject, xRunProjectPath, environmentType)

        const postmanFilesObject = await getAllPostmanFilesFromFilePathList(postmanFilePathList)

        for (const postmanFilePath in postmanFilesObject) {
            const xRunCollectionObject = {}

            const directoryPath = path.dirname(postmanFilePath)
            const directoryName = path.basename(directoryPath)
    
            xRunCollectionObject['globalVariables'] = postmanGlobalVariableObject
            xRunCollectionObject['environmentVariables'] = postmanEnvironmentVariableObject
            xRunCollectionObject['directoryName'] = directoryName
            xRunCollectionObject['collection'] = postmanFilesObject[postmanFilePath]['postmanFile']

            //Add xRunCollectionObject to xRunObject
            xRunObject['postmanCollections'].push(xRunCollectionObject)
        }

        return xRunObject
    } catch (error) {
        throw error
    }
}

module.exports = createXRunObjectFromPostmanList