////////////////////////////////////////////////////////////////////////////////
//    datastore.js - Store data.                                              //
//                                                                            //
//         Created by: schwaby.io                                             //
////////////////////////////////////////////////////////////////////////////////

const getFile = require('./getFile')
const createFile = require('./createFile')


//////////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////////
const datastore = function datastore(datastorePath) {
    let self = this
    self.datastorePath = datastorePath



    //////////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////////
    self.exists = async function exists() {

        try {
            const data = await getFile(self.datastorePath)

            return true
        } catch (error) {

            return false
        }
    }


    //////////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////////
    self.getValue = async function getValue(propertyName) {
        let data
        let dataObject
        
        try {
            data = await getFile(self.datastorePath)
        } catch (error) {
            throw new Error(`Error: Unable to read data store path '${self.datastorePath}': ${error.message}`)
        }

        try {
            dataObject = JSON.parse(data.toString())
        } catch (error) {
            throw new Error(`Error: Unable to parse data store object '${self.datastorePath}': ${error.message}`)
        }

        try {
            if (dataObject.hasOwnProperty(propertyName)) {

                const propertyValue = dataObject[propertyName]

                return propertyValue
            } else {
                throw new Error(`Oops, unable to locate '${propertyName}' in dataObject.`)
            }
        } catch (errMsg) {
            throw errMsg
        }

    }


    //////////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////////
    self.setValue = async function setValue(propertyName, propertyValue) {
        let data
        let dataObject

        const datastoreAlreadyExists = await self.exists()

        if (datastoreAlreadyExists === true) {
            //Update file
            try {

                data = await getFile(self.datastorePath)

                dataObject = JSON.parse(data.toString())

            } catch (error) {
                throw new Error(`Error: Unable to parse data store object '${self.datastorePath}': ${error.message}`)
            }

            dataObject[propertyName] = propertyValue

            try {

                await createFile(self.datastorePath, JSON.stringify(dataObject, null, 2))

            } catch (error) {
                throw new Error(`Oops, unable to update datastore file '${self.datastorePath}': ${error.message}`)
            }

            return "update-ok"
        } else {
            //Create file
            dataObject = {}
            dataObject[propertyName] = propertyValue

            try {
                await createFile(self.datastorePath, JSON.stringify(dataObject, null, 2))
            } catch (error) {
                throw new Error(`Oops, unable to create datastore file '${self.datastorePath}': ${error.message}`)
            }

            return "create-ok"
        }

    }
}


module.exports = datastore