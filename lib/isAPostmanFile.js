////////////////////////////////////////////////////////////////////////////////
//   isAPostmanFile.js - Determines if file is a postman file.                //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const isAPostmanFile = function isAPostmanFile(fileName) {
    var fileType = ''
    var strPos1 = 0

    //Format for a postman fileName is: {filename}.{filetype}.json

    fileName = path.basename(fileName.toString(), '.json')
    strPos1 = fileName.lastIndexOf('.')
    if (strPos1 > 0) {
      fileType = fileName.substring(strPos1 + 1)
    }

    if (fileType === 'postman_collection') {
        return true
    } else {
        return false
    }
}

module.exports = isAPostmanFile