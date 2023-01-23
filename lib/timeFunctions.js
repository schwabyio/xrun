////////////////////////////////////////////////////////////////////////////////
//   timeFunctions.js - Time functions.                                       //
//                                                                            //
//                Created by: schwaby.io                                      //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
var timeFunctions = function timeF() {
    var self = this
  
  
    //////////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////////
    self.inSeconds = function resultOfInSeconds() {
      var date = new Date()
      var timeInSeconds = Math.round(date.getTime() / 1000)
  
      return timeInSeconds
    }
  

    //////////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////////
    self.differenceReadableFormat = function resultOfDifferenceReadableFormat(startTime, endTime) {
      return convertSecondsToReadableFormat(endTime - startTime)
    }
  
  
    //////////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////////
    self.millisecondsToReadableFormat = function resultOfMillisecondsToReadableFormat(timeInMilliseconds) {
      return convertMillisecondsToReadableFormat(timeInMilliseconds)
    }
  
  
    //////////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////////
    function convertSecondsToReadableFormat(timeInSeconds) {
      var readableTimeFormat = ''
      var days = ''
      var hours = ''
      var minutes = ''
      var seconds = ''
  

      //If timeInSeconds is zero
      if (timeInSeconds === 0) {
         return '< 1 second'
      }

      //Conversions
      days = parseInt((timeInSeconds / 86400), 10)
      timeInSeconds -= (days * 86400)
      hours = parseInt((timeInSeconds / 3600), 10)
      timeInSeconds -= (hours * 3600)
      minutes = parseInt((timeInSeconds / 60), 10)
      seconds = timeInSeconds % 60

      //Format days
      if (days < 1) {
         days = ''
      } else if (days === 1) {
         days = days + ' day '
      } else if (days > 1) {
         days = days + ' days '
      }
  
      //Format hours
      if (hours < 1) {
         hours = ''
      } else if (hours === 1) {
         hours = hours + ' hour '
      } else if (hours > 1) {
         hours = hours + ' hours '
      }
  
      //Format minutes
      if (minutes < 1) {
         minutes = ''
      } else if (minutes === 1) {
         minutes = minutes + ' minute '
      } else if (minutes > 1) {
         minutes = minutes + ' minutes '
      }
  
      //Format seconds
      if (seconds < 1) {
         seconds = ''
      } else if (seconds === 1) {
         seconds = seconds + ' second'
      } else if (seconds > 1) {
         seconds = seconds + ' seconds'
      }
  
      //Construct readableTimeFormat
      readableTimeFormat = days + hours + minutes + seconds
  
      return readableTimeFormat
    }
  
  
    //////////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////////
    function convertMillisecondsToReadableFormat(timeInMilliseconds) {
      var readableTimeFormat = ''
      var hours = ''
      var minutes = ''
      var seconds = ''
      var milliseconds = ''
  
      //Conversions
      hours = parseInt((timeInMilliseconds / 3600000), 10)
      timeInMilliseconds -= (hours * 3600000)
      minutes = parseInt((timeInMilliseconds / 60000), 10)
      timeInMilliseconds -= (minutes * 60000)
      seconds = parseInt((timeInMilliseconds / 1000), 10)
      timeInMilliseconds -= (seconds * 1000)
      milliseconds = timeInMilliseconds.toString().padStart(3, '0')
  
      //Format hours
      if (hours > 0) {
        //Construct readableTimeFormat
        readableTimeFormat = hours + 'h ' + minutes + 'm'
      } else if (minutes > 0) {
        //Construct readableTimeFormat
        readableTimeFormat = minutes + 'm ' + seconds + 's'
      } else {
        //Construct readableTimeFormat
        readableTimeFormat = seconds + '.' + milliseconds + 's'
      }
  
      return readableTimeFormat
    }
  
  
    //////////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////////
    String.prototype.padStart = function padS(l, c) {
      return Array(l - this.length + 1).join(c||" ") + this
    }
  }
  
  
  module.exports = timeFunctions;
  