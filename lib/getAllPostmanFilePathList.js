////////////////////////////////////////////////////////////////////////////////
//   getAllPostmanFilePathList.js - For a directory list, get a list of all   //
//                               Postman file paths.                          //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const getAllPostmanFilePathsForADirectory = require('./getAllPostmanFilePathsForADirectory')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const getAllPostmanFilePathList = async function getAllPostmanFilePathList(directoryPathList, throwErrorOnEmptyDirectory) {
    let postmanFilePathList = []

    try {

        for (const directoryPath of directoryPathList) {

          const absoluteDirectoryPath = path.isAbsolute(directoryPath) ? directoryPath : path.join(process.cwd(), directoryPath)
          
          const postmanFilePathsList = await getAllPostmanFilePathsForADirectory(absoluteDirectoryPath)

          if (throwErrorOnEmptyDirectory === true && postmanFilePathsList.length === 0) {
            errMsg = `No Postman type files were found in the provided directoryPath '${directoryPath}'`
            throw new Error(errMsg)
          }

          for (const postmanFilePath of postmanFilePathsList) {
              postmanFilePathList.push(postmanFilePath)
          }
        }

        return postmanFilePathList

      } catch (error) {
        throw error
      }
}


module.exports = getAllPostmanFilePathList
