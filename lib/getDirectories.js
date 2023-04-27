////////////////////////////////////////////////////////////////////////////////
//    getDirectories.js - Get all directories within a directory.             //
//                                                                            //
//         Created by: schwaby.io                                             //
////////////////////////////////////////////////////////////////////////////////
const { readdir } = require('node:fs/promises')



  //////////////////////////////////////////////////////////////////////////////
  // Returns a list of directory names (not paths)
  //////////////////////////////////////////////////////////////////////////////
  const getDirectories = async function getDirectories(directoryPath) {

    try {
        const files = await readdir(directoryPath, { withFileTypes: true })

        const directoryList = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)

        return directoryList

    } catch(error) {
        throw error
    }
  }


  module.exports = getDirectories