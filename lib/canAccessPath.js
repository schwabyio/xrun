////////////////////////////////////////////////////////////////////////////////
//    canAccessPath.js - Checks if can access file or directory.              //
//                                                                            //
//         Created by: schwaby.io                                             //
////////////////////////////////////////////////////////////////////////////////
const { access } = require('node:fs/promises')


const canAccessPath = async function canAccessPath(path) {

    try {
        const data = await access(path)

        return true
    } catch(error) {
        throw error
    }
}


  module.exports = canAccessPath