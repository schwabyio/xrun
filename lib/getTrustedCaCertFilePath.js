////////////////////////////////////////////////////////////////////////////////
//   getTrustedCaCertFilePath.js - Get absolute file path of trusted CA cert  //
//                                 for Newman options.sslExtraCaCerts.        //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const { readdir } = require('node:fs/promises')
const path = require('node:path')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const getTrustedCaCertFilePath = async function getTrustedCaCertFilePath(settings) {
    const defaultTrustedCaCertDirectoryPath = 'trustedCaCert'
    let directoryPath

    //Check if settings.trustedCaCertDirectoryPath is an absolute path
    if (path.isAbsolute(settings.trustedCaCertDirectoryPath)) {
        directoryPath = settings.trustedCaCertDirectoryPath
    } else {
        //Need to join
        directoryPath = path.join(settings.xRunProjectPath, settings.xRunProjectDirectoryName, settings.trustedCaCertDirectoryPath)
    }

    try {
        const filePathArray = []

        //Read directoryPath for a .pem file
        const files = await readdir(directoryPath)

        //Loop over all files
        for (const fileName of files) {

            //Only add files that match '.pem' file extension
            if (path.extname(fileName) === '.pem') {
            filePathArray.push(path.join(directoryPath, fileName))
            }
        }

        if (filePathArray.length === 1) {
            //There should only be one '.pem' file, return
            return filePathArray[0]
        } else if (filePathArray.length === 0) {
            console.log(`WARNING: No '.pem' file was found within '${directoryPath}'`)
            return null
        } else {
            console.log(`WARNING: Found more than one '.pem' file within '${directoryPath}'. Only using the first found '${filePathArray[0]}'`)
            return filePathArray[0]
        }

    } catch (error) {
        //Do not throw error

        //Only display warnings when NOT using default trustedCaCertDirectoryPath
        if (settings.trustedCaCertDirectoryPath !== defaultTrustedCaCertDirectoryPath) {
            //Do not throw error, just display warningMessage
            const warningMessage = `WARNING: unable to getTrustedCaCertFilePath(): ${error.code} '${directoryPath}' - ${error.message}`
            console.log(warningMessage)
        }

        return null
    }
}


module.exports = getTrustedCaCertFilePath
