////////////////////////////////////////////////////////////////////////////////
//     settings.js - Settings support for xRun.                               //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////

const settingsSchema = require('./json/settings-schema.json')

const convict = require('convict');
const json5 = require('json5')


//////////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////////
const settings = function settings() {
  let self = this


  ////////////////////////////////////////////////////////////////////////////
  //Custom validators
  ////////////////////////////////////////////////////////////////////////////
  // 'nat-not-zero'
  convict.addFormat({
    name: 'nat-not-zero',
    validate: function(val) {
      if (!/^\+?([1-9]\d*)$/.test(val)) {
        throw new Error(`value must be a positive integer and also not zero: '${val}'`);
      }
    }
  })

  // 'boolean'
  convict.addFormat({
    name: 'boolean',
    validate: function(val) {
      //Check for Boolean type
      if (typeof val !== 'boolean') {
        throw new Error(`value is not a Boolean type: '${val}'`);
      }
    },
    coerce: function(val) {
      if (val === 'true' || val === 'false') {
        return (val === 'true')
      } else {
        return val
      }
    }
  })

  // 'string'
  convict.addFormat({
    name: 'string',
    validate: function(val) {
      //Check for String type
      if (typeof val !== 'string') {
        throw new Error(`value is not a String type: '${val}'`);
      }

    }
  })

  // 'non-empty-string'
  convict.addFormat({
    name: 'non-empty-string',
    validate: function(val) {
      //Check for String type
      if (typeof val !== 'string') {
        throw new Error(`value is not a String type: '${val}'`);
      }

      //Check value is not empty
      if (val.trim() === '') {
        throw new Error(`value must be a non-empty string: '${val}'`);
      }

    }
  })

  // 'non-empty-no-spaces-string'
  convict.addFormat({
    name: 'non-empty-no-spaces-string',
    validate: function(val) {
      //Check for String type
      if (typeof val !== 'string') {
        throw new Error(`value is not a String type: '${val}'`);
      }

      //Check value is not empty
      if (val.trim() === '') {
        throw new Error(`value must be a non-empty string: '${val}'`);
      }

      //Check value does not contain any white space characters
      if (/\s+/.test(val)) {
        throw new Error(`value must not contain any whitespace characters: '${val}'`);
      }

    }
  })
  ////////////////////////////////////////////////////////////////////////////
  //End of custom validators
  ////////////////////////////////////////////////////////////////////////////



  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  self.init = async function init(settingsPath) {
    const settings = convict(settingsSchema)

    // Support JSON5 format (e.g. json comments)
    convict.addParser({extension: 'json', parse: json5.parse})
  
    //Load settings file
    try {
      settings.loadFile(settingsPath)
    } catch (error) {
      throw new Error(`Oops, unable to load settings file '${settingsPath}': ${error.message}`)
    }
  
    //Perform validation
    try {
      settings.validate({allowed: 'strict'})

      const settingsObject = JSON.parse(settings)

      return settingsObject
    } catch (error) {
      throw new Error(`Oops, settings '${settingsPath}' validation error: ${error.message}`)
    }
  
  }
}


module.exports = settings
