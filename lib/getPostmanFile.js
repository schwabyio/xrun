////////////////////////////////////////////////////////////////////////////////
//   getPostmanFile.js - Get postman json file.                               //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const getFile = require('./getFile')

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
async function getPostmanFile(filePath) {

  try {

    const data = await getFile(filePath)

    const postmanObject = JSON.parse(data.toString())

    return postmanObject

  } catch (error) {
    throw new Error("Oops, got the following error retrieving the Postman file '" + filePath + "': " + error.code + " - " + error.message)
  }
}


module.exports = getPostmanFile
