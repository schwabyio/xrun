////////////////////////////////////////////////////////////////////////////////
//    canAccessPath.js - Checks if can access file or directory.              //
//                                                                            //
//         Created by: schwaby.io                                             //
////////////////////////////////////////////////////////////////////////////////
const { access } = require('node:fs/promises')


const canAccessPath = async function canAccess(path) {

    try {
        const data = await access(path)

        return true
    } catch(err) {
        throw err
    }
}


  module.exports = canAccessPath