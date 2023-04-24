////////////////////////////////////////////////////////////////////////////////
//   getAllPostmanFiles.js - Get all postman files as object.                 //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const getFilePathsInDirectory = require('./getFilePathsInDirectory')
const isAPostmanFile = require('./isAPostmanFile')
const getPostmanFile = require('./getPostmanFile')

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const getAllPostmanFiles = async function getAllPostmanFiles(directoryList) {
    let errMsg = ''
    let postmanFilesObject = {}
    let postmanCollectionCounter = 0


    try {

        //Loop over directoryList
        for (const directoryPath of directoryList) {

            //Initialize postmanFilesObject[directoryPath]
            postmanFilesObject[directoryPath] = {}

            const filePathArray = await getFilePathsInDirectory(directoryPath, '.json')

            //Reset
            postmanCollectionCounter = 0
    

            for (const filePath of filePathArray) {
                if (isAPostmanFile(filePath)) {
                    postmanCollectionCounter++
        
                    //Add to postmanFilesObject[directoryPath]
                    postmanFilesObject[directoryPath][path.basename(filePath)] = {}
                } else {
                    //Not a postman type file; do nothing
                }
            }
    
            if (postmanCollectionCounter === 0) {
              errMsg = "Oops, at least one 'postman_collection' file is required per directory. Did not find any within: " + directoryPath
              throw new Error(errMsg)
            }
        
            //Read all files
            for (const directoryPath in postmanFilesObject) {
              for (const fileName in postmanFilesObject[directoryPath]) {
                const postmanFilePath = path.join(directoryPath, fileName)
                const postmanFile = await getPostmanFile(postmanFilePath)

                postmanFilesObject[directoryPath][fileName] = postmanFile
              }
            }
        }

        return postmanFilesObject

      } catch (error) {
        throw error
      }
}


module.exports = getAllPostmanFiles
