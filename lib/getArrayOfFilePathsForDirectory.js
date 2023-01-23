////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//   getArrayOfFilePathsForDirectory.js - Get an array of file paths in a     //
//                                        directory.                          //
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
function getArrayOfFilePathsForDirectory(directoryPath, fileExtensionFilter, callback) {
  var errMsg = ''
  var filePathArray = []
  var arrayCount = 0
  var fileIterationCount = 0


    fs.readdir(directoryPath, function resultOfReadDirectory(err, files) {
      if (err) {
        errMsg = "Oops, an error occurred trying to read directory: " + directoryPath + ' - ' + err.code + " - " + err.message
        return callback(errMsg)
      } else {
        //Get count of number of files in settings.configDirectoryOrFilePath
        arrayCount = files.length

        //Loop over all files
        files.forEach(function resultOfForEach(fileName) {
          //Increment fileIterationCount
          fileIterationCount++

          //Only add files that match fileExtensionFilter to filePathArray
          if (path.extname(fileName) === fileExtensionFilter) {
            filePathArray.push(path.join(directoryPath, fileName))
          }

          //All done
          if (arrayCount === fileIterationCount) {
            return callback(null, filePathArray, directoryPath)
          }
        })
      }
    })

}


module.exports = getArrayOfFilePathsForDirectory
