////////////////////////////////////////////////////////////////////////////////
//   getHostName.js - Get various formats of hostname for this local machine. //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const os = require('node:os')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const getHostName = function getHostName() {
  const self = this

  self.raw = function raw() {
    return os.hostname()
  }

  self.short = function short(rawHostName) {
    let shortHostName = ''
    let strPos1 = 0

    strPos1 = rawHostName.indexOf(".")
    if (strPos1 > 0) {
      shortHostName = rawHostName.substring(0, strPos1)
    } else {
      shortHostName = rawHostName
    }

    return shortHostName
  }
}


module.exports = getHostName
