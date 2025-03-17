////////////////////////////////////////////////////////////////////////////////
//   getAllPostmanFilesFromFilePathList.js - Get postman files from list.     //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const getPostmanFile = require('./getPostmanFile')

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const getAllPostmanFilesFromFilePathList = async function getAllPostmanFilesFromFilePathList(postmanFilePathList) {
    const postmanFilesObject = {}

    try {

        for (const postmanFilePath of postmanFilePathList) {

            const postmanFile = await getPostmanFile(postmanFilePath)

            postmanFilesObject[postmanFilePath] = {}
            postmanFilesObject[postmanFilePath]['postmanFile'] = {}
            postmanFilesObject[postmanFilePath]['postmanFile'] = postmanFile
        }

        return postmanFilesObject

      } catch (error) {
        throw error
      }
}

module.exports = getAllPostmanFilesFromFilePathList
