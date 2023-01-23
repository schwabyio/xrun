////////////////////////////////////////////////////////////////////////////////
//   getHostname.js - Get various formats of hostname for this local machine. //
//                                                                            //
//                Created by: schwaby.io                                      //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
var os = require('os')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
var getHostname = function getH() {
  var self = this

  self.short = function resultOfGetShortHostname() {
    var rawHostname = os.hostname()
    var shortHostname = ''
    var strPos1 = 0

    strPos1 = rawHostname.indexOf(".")
    if (strPos1 > 0) {
      shortHostname = rawHostname.substring(0, strPos1)
    } else {
      shortHostname = rawHostname
    }

    return shortHostname
  }
}


module.exports = getHostname;
