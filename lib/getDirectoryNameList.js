////////////////////////////////////////////////////////////////////////////////
//    getDirectoryNameList.js - Get all directory names within a directory    //
//                              as a list.                                    //
//                                                                            //
//         Created by: schwaby.io                                             //
////////////////////////////////////////////////////////////////////////////////
const { readdir } = require('node:fs/promises')



  //////////////////////////////////////////////////////////////////////////////
  // Returns a list of directory names (not paths)
  //////////////////////////////////////////////////////////////////////////////
  const getDirectoryNameList = async function getDirectoryNameList(directoryPath) {

    try {
        const files = await readdir(directoryPath, { withFileTypes: true })

        const directoryList = files.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)

        return directoryList

    } catch(error) {
        throw error
    }
  }


  module.exports = getDirectoryNameList