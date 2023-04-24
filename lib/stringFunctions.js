////////////////////////////////////////////////////////////////////////////////
//    stringFunctions.js - String methods.                                    //
//                                                                            //
//         Created by: schwaby.io                                             //
////////////////////////////////////////////////////////////////////////////////


const stringFunctions = function stringFunctions() {
    const self = this

    self.replaceSpecialChars = function replaceSpecialChars(string) {
        let replacedString = string
    
        replacedString = replacedString.replace(/\\/g, '-')
        replacedString = replacedString.replace(/\//g, '-')

        return replacedString
    }


    self.padStart = function padStart(string, lengthToPad, characterToPad) {

        if (string.length > lengthToPad) {
            return string
        } else {
            return Array(lengthToPad - string.length + 1).join(characterToPad || ' ') + string
        }
    }


    self.padEnd = function padEnd(string, lengthToPad, characterToPad) {
        if (string.length > lengthToPad) {
            return string
        } else {
            return string + Array(lengthToPad - string.length + 1).join(characterToPad || ' ')
        }
    }
}

module.exports = stringFunctions