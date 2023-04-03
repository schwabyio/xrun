////////////////////////////////////////////////////////////////////////////////
//    getFile.js - Get a file.                                                //
//                                                                            //
//         Created by: schwaby.io                                             //
////////////////////////////////////////////////////////////////////////////////
const { readFile } = require('node:fs/promises')



  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  const getFile = async function getFile(filePath) {

    try {
      const data = await readFile(filePath, { encoding: 'utf8' })

      return data
    } catch(err) {
      throw err
    }
  }


  module.exports = getFile