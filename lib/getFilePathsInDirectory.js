////////////////////////////////////////////////////////////////////////////////
//   getFilePathsInDirectory.js - Get an array of file paths in a directory.  //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const { readdir } = require('node:fs/promises')
const path = require('node:path')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const getFilePathsInDirectory = async function getFilePathsInDirectory(directoryPath, fileExtensionFilter) {
  let errMsg = ''
  let filePathArray = []

  try {
    const files = await readdir(directoryPath)

    //Get count of number of files
    arrayCount = files.length

    //Loop over all files
    for (const fileName of files) {

      //Only add files that match fileExtensionFilter to filePathArray
      if (path.extname(fileName) === fileExtensionFilter) {
        filePathArray.push(path.join(directoryPath, fileName))
      }
    }

    //All done
    return filePathArray
  } catch (error) {
    errMsg = "Oops, an error occurred trying to read directory: " + directoryPath + ' - ' + error.code + " - " + error.message
    throw new Error(errMsg)
  }
}


module.exports = getFilePathsInDirectory
