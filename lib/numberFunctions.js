////////////////////////////////////////////////////////////////////////////////
//    numberFunctions.js - Number methods.                                    //
//                                                                            //
//         Created by: schwaby.io                                             //
////////////////////////////////////////////////////////////////////////////////


const numberFunctions = function numberFunctions() {
    const self = this

    self.withCommas = function withCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

}

module.exports = numberFunctions