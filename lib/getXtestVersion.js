////////////////////////////////////////////////////////////////////////////////
//   getXtestVersion.js - Get xtest version.                                  //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////

const getFile = require('./getFile')

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const getXtestVersion = async function getXtestVersion(globalVariablesPath) {

    try {
        const data = await getFile(globalVariablesPath)

        const variableObject = bulkVariablesToObject(data)

        const xtestCodeAsString = variableObject.xtest

        //Note: could do an eval() on xtestCodeAsString and use the xtest getVersion() function but parsing seems safer.

        //Parse version from xtestCodeAsString
        const xtestVersion = parseXtestVersion(xtestCodeAsString)

        return xtestVersion
    } catch (error) {
        throw error
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////
    function parseXtestVersion(xtestCode) {
        let xtestVersion = 'Not Found'

        //Start and end search strings
        const startSearchString = 'version="'
        const endSearchString = '"'

        //Set lengths
        const startSearchStringLength = startSearchString.length
        const endSearchStringLength = endSearchString.length


        const startPosition = xtestCode.indexOf(startSearchString)

        if (startPosition >= 0) {
            const endPosition = xtestCode.indexOf(endSearchString, startPosition + startSearchStringLength)

            if (endPosition >= 0) {
                //Update xtestVersion with parsed value
                xtestVersion = xtestCode.substring(startPosition + startSearchStringLength, endPosition)
            }
        }

        return xtestVersion
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////
    function bulkVariablesToObject(data) {
        const responseObject = {}
        const bulkData = data.toString('utf-8')
        const lineArray = bulkData.split(/\r\n|\r|\n/)
        let keyValueString = ''
        let strPos1 = 0
        let key = ''
        let value = ''

        for (const line of lineArray) {
            keyValueString = line.trim()
    
            if (keyValueString.length > 0) {
              strPos1 = keyValueString.indexOf(':')
              if (strPos1 >= 0) {
                key = keyValueString.substring(0, strPos1)
                value = keyValueString.substring(strPos1 + 1)
      
                responseObject[key.trim()] = value.trim()
              }
            }
        }

        return responseObject
    }

}
module.exports = getXtestVersion