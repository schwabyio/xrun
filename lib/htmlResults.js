////////////////////////////////////////////////////////////////////////////////
//   htmlResults.js - HTML result methods.                                    //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////

const handlebars = require('handlebars')
const open = require('open')

const getFile = require('./getFile')
const createFile = require('./createFile')

////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const htmlResults = function htmlResults() {
    const self = this


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.getCollectionHtmlReport = async function getCollectionHtmlReport(collectionTemplatePath, collectionResults) {
      // const collectionHtmlPath = path.join(testResultsHtmlPath, collectionResults.collectionName + '.html')
      // const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')

      //Add helpers
      handlebars.registerHelper("increment", function(value, options) {
        return parseInt(value) + 1
      })
  
      handlebars.registerHelper("uriencode", function(value, options) {
        return encodeURIComponent(value)
      })
  
      handlebars.registerHelper('compareStrings', function(p, q, options) {
        return (p == q) ? options.fn(this) : options.inverse(this);
      })
  
      //DEBUG: https://gist.github.com/karlwestin/3487951
      //Put {{log 0 item}} anywhere in template to print out 'item'
      // handlebars.logger.log = function(level) {
      //   if(level >= handlebars.logger.level) {
      //     //console.log.apply(console, [].concat(["Handlebars: "], _.toArray(arguments)));
      //     console.log.apply(console, arguments)
      //   }
      // }
      // handlebars.registerHelper('log', handlebars.logger.log)
      // Std level is 3, when set to 0, handlebars will log all compilation results
      // handlebars.logger.level = 0

      try {
        const data = await getFile(collectionTemplatePath)
        const collectionTemplate = data.toString()

        try {
          //preventIndent = true prevents indentation within partials (e.g. prevents unwanted indenting in <pre></pre> tags within partials)
          //https://github.com/handlebars-lang/handlebars.js/issues/858
          const template = handlebars.compile(collectionTemplate, {noEscape: true, preventIndent: true})
          
          const collectionHtmlReport = template(collectionResults)
  
          return collectionHtmlReport
        } catch (error) {
          throw error
        }
      } catch (error) {
        throw new Error("Oops, unable to read collection template file '" + collectionTemplatePath + "' due to the following: " + error.message)
      }
    }


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.writeCollectionHtmlReport = async function writeCollectionHtmlReport(collectionHtmlPath, collectionHtmlReport) {
      
      try {
        await createFile(collectionHtmlPath, collectionHtmlReport)
      } catch (error) {
        throw new Error("Oops, unable to write collection html report to '" + collectionHtmlPath + "' due to the following: " + error.message)
      }
    }


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.createCollectionHtmlReport = async function createCollectionHtmlReport(collectionTemplatePath, collectionResults, collectionHtmlPath) {

      try {
        const collectionHtmlReport = await self.getCollectionHtmlReport(collectionTemplatePath, collectionResults)

        await self.writeCollectionHtmlReport(collectionHtmlPath, collectionHtmlReport)
      } catch (error) {
        throw error
      }
    }


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.getSummaryHtmlReport = async function getSummaryHtmlReport(summaryTemplatePath, testResultSummary) {
      // const summaryHtmlPath = path.join(testResultsHtmlPath, 'summary.html')
      // const summaryTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-summary.hbs')
  
      //Add helpers
      handlebars.registerHelper("increment", function(value, options) {
        return parseInt(value) + 1
      })
  
      handlebars.registerHelper("uriencode", function(value, options) {
        return encodeURIComponent(value)
      })
  
      handlebars.registerHelper('compareStrings', function(p, q, options) {
        return (p == q) ? options.fn(this) : options.inverse(this);
      })

      try {
        const data = await getFile(summaryTemplatePath)
        const summaryTemplate = data.toString()
  
        try {
          //preventIndent = true prevents indentation within partials (e.g. prevents unwanted indenting in <pre></pre> tags within partials)
          //https://github.com/handlebars-lang/handlebars.js/issues/858
          const template = handlebars.compile(summaryTemplate)
          
          const summaryHtmlReport = template(testResultSummary)

          return summaryHtmlReport
        } catch (error) {
          throw error
        }

      } catch (error) {
        throw new Error("Oops, unable to read summary template file '" + summaryTemplatePath + "' due to the following: " + error.message)
      }
    }


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.writeSummaryHtmlReport = async function writeSummaryHtmlReport(settings, summaryHtmlPath, summaryHtmlReport) {
      const autoOpenTestResultHtml = settings.autoOpenTestResultHtml

      try {
        await createFile(summaryHtmlPath, summaryHtmlReport)

        if (autoOpenTestResultHtml === true) {
          open(summaryHtmlPath)
        }
      } catch (error) {
        throw new Error("Oops, unable to write html summary to '" + summaryHtmlPath + "' due to the following: " + error.message)
      }
    }


    ////////////////////////////////////////////////////////////////////////////
    //
    ////////////////////////////////////////////////////////////////////////////
    self.createSummaryHtmlReport = async function createSummaryHtmlReport(settings, summaryTemplatePath, testResultSummary, summaryHtmlPath) {

      try {
        const summaryHtmlReport = await self.getSummaryHtmlReport(summaryTemplatePath, testResultSummary)

        await self.writeSummaryHtmlReport(settings, summaryHtmlPath, summaryHtmlReport)
      } catch (error) {
        throw error
      }
    }

}

module.exports = htmlResults