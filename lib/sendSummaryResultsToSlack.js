////////////////////////////////////////////////////////////////////////////////
//   sendSummaryResultsToSlack.js - Send summary results to slack.            //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const Slack = require('./slack')
const getHostName = require('./getHostName')


//////////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////////
const sendSummaryResultsToSlack = async function sendSummaryResultsToSlack(settings, testResultSummary, testResultsUrl) {
    const slack = new Slack(settings.slackToken)
    const hostName = new getHostName()
    const hostNameRaw = hostName.raw()
    const localMachineNameShort = hostName.short(hostNameRaw)
    const pathLocation = path.join(__dirname, '../')
    let slackIcon = ''
    let slackUser = ''
    let testResultsLink = 'Not Available'
    let hardAlertFlag = false
    let slackTextPrefix = ''
    const slackObject = {}


    if (settings.sendSummaryResultsToSlack === true) {

        process.stdout.write("Sending summary results to slack...")

        if (testResultSummary['testFinalResult'] === 'PASSED') {
            slackIcon = settings.slackIconTestsPass
            slackUser = settings.projectName + '-' + settings.suiteId + ' - PASSED'

            if (settings.slackHardAlertOnSuccess === true) {
                hardAlertFlag = true
            } else {
                hardAlertFlag = false
            }
        } else {
            slackIcon = settings.slackIconTestsFail
            slackUser = settings.projectName + '-' + settings.suiteId + ' - FAILED'

            if (settings.slackHardAlertOnFailure === true) {
                hardAlertFlag = true
            } else {
                hardAlertFlag = false
            }
        }

        //Set testResultsLink
        if (testResultsUrl) {
            testResultsLink = "<" + testResultsUrl + "|Click Here>"
        }


        //https://api.slack.com/reference/surfaces/formatting#special-mentions
        if (hardAlertFlag === true) {
            slackTextPrefix = '<!channel> '
        } else {
            slackTextPrefix = ''
        }

        //Set requestJsonObject
        slackObject['text'] = slackTextPrefix + "Greetings from " + localMachineNameShort + ":" + pathLocation + ". Here are my automated test results:\n\n*Project Name:* " + settings.projectName + "\n*Suite ID:* " + settings.suiteId + "\n*Environment Type:* " + settings.environmentType + "\n*Concurrency Limit:* " + settings.limitConcurrency + "\n*Total Collections:* " + testResultSummary['collectionsTotalPrintable'] + ", *Collections Passed:* " + testResultSummary['collectionsPassedPrintable'] + ", *Collections Failed:* " + testResultSummary['collectionsFailedPrintable'] + "\n*Total Assertions:* " + testResultSummary['tallyAssertionsTotalPrintable'] + ", *Assertions Passed:* " + testResultSummary['tallyAssertionsPassedPrintable'] + ", *Assertions Failed:* " + testResultSummary['tallyAssertionsFailedPrintable'] + "\n*Run Time:* " + testResultSummary['testDurationTotalPrintable'] + "\n*Test Results:* " + testResultsLink
        slackObject['icon_emoji'] = slackIcon
        slackObject['channel'] = settings.slackChannel
        slackObject['username'] = slackUser


        try {

            const result = await slack.postMessage(slackObject)

            console.log("success!")

            return "OK"
        } catch (error) {
            throw error
        }

    } else {
        return "SKIPPED"
    }
}

module.exports = sendSummaryResultsToSlack