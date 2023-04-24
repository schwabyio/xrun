////////////////////////////////////////////////////////////////////////////////
//    stringCompare.js - String comparison methods.                           //
//                                                                            //
//         Created by: schwaby.io                                             //
////////////////////////////////////////////////////////////////////////////////


const stringCompare = function stringCompare() {
    const self = this

    self.insensitive = function insensitive(string1, string2) {
        const string1Lower = string1.toLowerCase()
        const string2Lower = string2.toLowerCase()
    
        return string1Lower > string2Lower? 1 : (string1Lower < string2Lower? -1 : 0)
    }
}

module.exports = stringCompare