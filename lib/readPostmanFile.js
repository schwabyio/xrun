////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//   readPostmanFile.js - Read postman json file.                             //
//                                                                            //
//                Created by: schwaby.io                                      //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
var fs = require('fs')
var path = require('path')



////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
function readPostmanFile(directoryPath, fileName, callback) {
  var errMsg = ''
  var postmanObject = {}
  var filePath = path.join(directoryPath, fileName)


  fs.readFile(filePath, function resultOfReadFile(err, data) {
    if (err) {
      if (err.code === 'ENOENT') {
        //fileExists = false: File does not exist or don't have permission to read
        return callback(null, null, false, directoryPath, fileName)
      } else {
        errMsg = "Oops, got the following error reading file '" + filePath + "': " + err.code + " - " + err.message
        return callback(errMsg)
      }
    } else {
      try {
        postmanObject = JSON.parse(data.toString())
      } catch (err) {
        errMsg = "Oops, error converting postman file '" + filePath + "' to object: " + err.message
        return callback(errMsg)
      }

      return callback(null, postmanObject, true, directoryPath, fileName)
    }
  })
}


module.exports = readPostmanFile
