////////////////////////////////////////////////////////////////////////////////
//   timeFunctions.js - Time functions.                                       //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////

const stringFunctions = require('./stringFunctions')

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
var timeFunctions = function timeFunctions() {
   const self = this
   const string = new stringFunctions()


   //////////////////////////////////////////////////////////////////////////////
   //
   //////////////////////////////////////////////////////////////////////////////
   self.inSeconds = function inSeconds() {
      const date = new Date()
      const timeInSeconds = Math.round(date.getTime() / 1000)

      return timeInSeconds
   }
  
  
   //////////////////////////////////////////////////////////////////////////////
   //
   //////////////////////////////////////////////////////////////////////////////
   self.millisecondsToReadableFormat = function millisecondsToReadableFormat(timeInMilliseconds) {
      let readableTimeFormat = ''
      let hours = ''
      let minutes = ''
      let seconds = ''
      let milliseconds = ''

      //Conversions
      hours = parseInt((timeInMilliseconds / 3600000), 10)
      timeInMilliseconds -= (hours * 3600000)
      minutes = parseInt((timeInMilliseconds / 60000), 10)
      timeInMilliseconds -= (minutes * 60000)
      seconds = parseInt((timeInMilliseconds / 1000), 10)
      timeInMilliseconds -= (seconds * 1000)
      milliseconds = string.padStart(timeInMilliseconds.toString(), 3, '0')

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
   self.differenceReadableFormat = function resultOfDifferenceReadableFormat(startTime, endTime) {
      return self.convertSecondsToReadableFormat(endTime - startTime)
   }


    //////////////////////////////////////////////////////////////////////////////
    //
    //////////////////////////////////////////////////////////////////////////////
    self.convertSecondsToReadableFormat = function convertSecondsToReadableFormat(timeInSeconds) {
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
      //} else if (days > 1) {
      } else {
         days = days + ' days '
      }
  
      //Format hours
      if (hours < 1) {
         hours = ''
      } else if (hours === 1) {
         hours = hours + ' hour '
      //} else if (hours > 1) {
      } else {
         hours = hours + ' hours '
      }
  
      //Format minutes
      if (minutes < 1) {
         minutes = ''
      } else if (minutes === 1) {
         minutes = minutes + ' minute '
      //} else if (minutes > 1) {
      } else {
         minutes = minutes + ' minutes '
      }
  
      //Format seconds
      if (seconds < 1) {
         seconds = ''
      } else if (seconds === 1) {
         seconds = seconds + ' second'
      //} else if (seconds > 1) {
      } else {
         seconds = seconds + ' seconds'
      }
  
      //Construct readableTimeFormat
      readableTimeFormat = days + hours + minutes + seconds
  
      return readableTimeFormat
    }

  }
  
  
  module.exports = timeFunctions;
  