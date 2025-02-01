////////////////////////////////////////////////////////////////////////////////
//   createXRunObject.js - Create an xrun object.                             //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const xRunPostmanVariables = require('./xRunPostmanVariables')
const getAllPostmanFiles = require('./getAllPostmanFiles')
const isAPostmanFile = require('./isAPostmanFile')
const getXtestVersion = require('./getXtestVersion')



////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const createXRunObject = async function createXRunObject(settings, directoryList) {
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

        const postmanFilesObject = await getAllPostmanFiles(directoryList)

        for (const directoryPath in postmanFilesObject) {
            for (const fileName in postmanFilesObject[directoryPath]) {
                const xRunCollectionObject = {}

                xRunCollectionObject['globalVariables'] = postmanGlobalVariableObject
                xRunCollectionObject['environmentVariables'] = postmanEnvironmentVariableObject
                xRunCollectionObject['directoryName'] = path.basename(directoryPath)
                xRunCollectionObject['collection'] = postmanFilesObject[directoryPath][fileName]

                //Add xRunCollectionObject to xRunObject
                xRunObject['postmanCollections'].push(xRunCollectionObject)
            }
        }

        return xRunObject
    } catch (error) {
        throw error
    }
}

module.exports = createXRunObject