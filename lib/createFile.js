////////////////////////////////////////////////////////////////////////////////
//    createFile.js - Create a file.                                          //
//                                                                            //
//         Created by: schwaby.io                                             //
////////////////////////////////////////////////////////////////////////////////
const { writeFile } = require('node:fs/promises')



//////////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////////
const createFile = async function createFile(filePath, data) {

  try {
    
    await writeFile(filePath, data, { encoding: 'utf8' })

  } catch(error) {
    throw error
  }
}


module.exports = createFile