////////////////////////////////////////////////////////////////////////////////
//   xRunPostmanVariables.js - Methods for xrun and postman variables.        //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')


const getFile = require('./getFile')
const appInfo = require('./appInfo')

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const xRunPostmanVariables = function xRunPostmanVariables() {
    const self = this
    const app = new appInfo()
    const appVersion = app.getVersion()
    const appName = app.getCLIName()


    ////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////
    self.getGlobalVariablesPath = function getGlobalVariablesPath() {
        return path.join(__dirname, '../', 'variables', 'global-variables.bulk')
    }

    ////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////
    self.populateAllVariables = async function populateAllVariables(globalVariablesPath, postmanGlobalVariableObject, postmanEnvironmentVariableObject, xRunProjectPath, environmentType) {
        
        try {
            await self.populateGlobalVariables(globalVariablesPath, postmanGlobalVariableObject)

            await self.populateEnvironmentVariables(postmanEnvironmentVariableObject, xRunProjectPath, environmentType)
        } catch (error) {
            throw error
        }

    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////
    self.populateEnvironmentVariables = async function populateEnvironmentVariables(postmanEnvironmentVariableObject, xRunProjectPath, environmentType) {
        const xRunProjectEnvironmentBulkFilePath = path.join(xRunProjectPath, '/xrun/', environmentType + '.bulk')

        //Add app version variable (needed for apihub)
        const versionKey = appName + '-version'
        const versionValue = appVersion
        self.addPostmanVariable(postmanEnvironmentVariableObject, versionKey, versionValue)


        try {
            const data = await getFile(xRunProjectEnvironmentBulkFilePath)

            //Populate local bulk variables
            self.populateBulkVariables(data, postmanEnvironmentVariableObject)

        } catch (error) {
            //Ignore any errors (i.e. optional xRunProjectEnvironmentBulkFilePath does not exist)
        }
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////
    self.populateGlobalVariables = async function populateGlobalVariables(globalVariablesPath, postmanGlobalVariableObject) {

        try {
            const data = await getFile(globalVariablesPath)

            //Populate global bulk variables
            self.populateBulkVariables(data, postmanGlobalVariableObject)

        } catch (error) {
            const errMsg = "Oops, unable to read global variables file '" + globalVariablesPath + "' due to the following: " + error.message
            throw new Error(errMsg)
        }
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////
    self.initializePostmanVariableObject = function initializePostmanVariableObject(variableType) {
        let name = ''
        let postmanVariableScope = ''
        let basePostmanVariableObject = {}
    
        //Set values based on variableType
        if (variableType === 'environment') {
          name = 'xRun Environment Variables'
          postmanVariableScope = 'environment'
        } else if (variableType === 'globals') {
          name = 'xRun Global Variables'
          postmanVariableScope = 'environment'
        }
    
        //Set properties
        basePostmanVariableObject["id"] = "24fc854b-bd95-4ea9-b64e-6b5c85ebdbcc"
        basePostmanVariableObject["name"] = name
        basePostmanVariableObject["values"] = []
        basePostmanVariableObject["timestamp"] = 1489171700473
        basePostmanVariableObject["_postman_variable_scope"] = postmanVariableScope
        basePostmanVariableObject["_postman_exported_at"] = "2017-09-05T22:03:25.433Z"
        basePostmanVariableObject["_postman_exported_using"] = "Postman/5.2.0"
    
        return basePostmanVariableObject
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////
    self.populateBulkVariables = function populateBulkVariables(data, postmanVariableObject) {
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
      
                self.addPostmanVariable(postmanVariableObject, key.trim(), value.trim())
              }
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////////
    self.addPostmanVariable = function addPostmanVariable(postmanVariableObject, key, value) {
        let keyValueObject = {}

        keyValueObject["enabled"] = true
        keyValueObject["key"] = key
        keyValueObject["value"] =  value
        keyValueObject["type"] = "text"
    
        postmanVariableObject.values.push(keyValueObject)
    }
}

module.exports = xRunPostmanVariables