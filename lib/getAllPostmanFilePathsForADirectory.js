////////////////////////////////////////////////////////////////////////////////
//   getAllPostmanFilePathsForADirectory.js - For a directory, get a list     //
//                               of all Postman file paths.                   //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const getFilePathsInDirectory = require('./getFilePathsInDirectory')
const isAPostmanFile = require('./isAPostmanFile')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const getAllPostmanFilePathsForADirectory = async function getAllPostmanFilePathsForADirectory(directoryPath) {
    let postmanFilePathList = []


    try {
        const filePathArray = await getFilePathsInDirectory(directoryPath, '.json')

        for (const filePath of filePathArray) {
            if (isAPostmanFile(filePath)) {
                postmanFilePathList.push(filePath)
            } else {
                //Not a postman type file; do nothing
            }
        }

        return postmanFilePathList

      } catch (error) {
        throw error
      }
}


module.exports = getAllPostmanFilePathsForADirectory
