////////////////////////////////////////////////////////////////////////////////
//   getDataFilePathObject.js - Get an object of collectionName to external    //
//                              data file path (.csv or .json) for Newman      //
//                              options.iterationData.                         //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const { readdir } = require('node:fs/promises')
const path = require('node:path')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const getDataFilePathObject = async function getDataFilePathObject(settings) {
    const defaultDataFileDirectoryPath = 'data'
    const supportedFileExtensionList = ['.csv', '.json']
    const dataFilePathObject = {}
    let directoryPath

    //Check if settings.dataFileDirectoryPath is an absolute path
    if (path.isAbsolute(settings.dataFileDirectoryPath)) {
        directoryPath = settings.dataFileDirectoryPath
    } else {
        //Need to join
        directoryPath = path.join(settings.xRunProjectPath, settings.xRunProjectDirectoryName, settings.dataFileDirectoryPath)
    }

    try {
        //Read directoryPath for data files - sorted so '.csv' always wins over '.json' for the same collection name
        const files = (await readdir(directoryPath)).sort()

        //Loop over all files
        for (const fileName of files) {
            const fileExtension = path.extname(fileName)

            //Only add files that match a supported data file extension
            if (supportedFileExtensionList.includes(fileExtension.toLowerCase())) {
                //The data file name (minus extension) must match the collection name it is used by
                const collectionName = path.basename(fileName, fileExtension)
                const filePath = path.join(directoryPath, fileName)

                if (dataFilePathObject.hasOwnProperty(collectionName)) {
                    console.log(`WARNING: Found more than one data file for collection name '${collectionName}' within '${directoryPath}'. Only using the first found '${dataFilePathObject[collectionName]}'`)
                } else {
                    dataFilePathObject[collectionName] = filePath
                }
            }
        }

        return dataFilePathObject
    } catch (error) {
        //Do not throw error

        //Only display warnings when NOT using default dataFileDirectoryPath
        if (settings.dataFileDirectoryPath !== defaultDataFileDirectoryPath) {
            //Do not throw error, just display warningMessage
            const warningMessage = `WARNING: unable to getDataFilePathObject(): ${error.code} '${directoryPath}' - ${error.message}`
            console.log(warningMessage)
        }

        return dataFilePathObject
    }
}


module.exports = getDataFilePathObject
