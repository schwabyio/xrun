/*

TODO: 1. Convert to async/await 2. Add unit tests

//////////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////////
function sendSummaryResultsToSlack(testResultSummary, testResultsUrl, callback) {
    const slack = new Slack(self.settings.slackToken)
    const localMachineNameShort = hostName.short(hostName.raw())
    const pathLocation = path.join(__dirname, '../')
    var slackIcon = ''
    var slackUser = ''
    var testResultsLink = 'Not Available'
    var hardAlertFlag = false
    var slackTextPrefix = ''
    const slackObject = {}

    if (self.settings.sendSummaryResultsToSlack === true) {
        process.stdout.write("Sending summary results to slack...")

        if (testResultSummary['testFinalResult'] === 'PASSED') {
        slackIcon = self.settings.slackIconTestsPass
        slackUser = self.settings.projectName + '-' + self.settings.suiteId + ' - PASSED'

        if (self.settings.slackHardAlertOnSuccess === true) {
            hardAlertFlag = true
        } else {
            hardAlertFlag = false
        }
        } else {
        slackIcon = self.settings.slackIconTestsFail
        slackUser = self.settings.projectName + '-' + self.settings.suiteId + ' - FAILED'

        if (self.settings.slackHardAlertOnFailure === true) {
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
        slackObject['text'] = slackTextPrefix + "Greetings from " + localMachineNameShort + ":" + pathLocation + ". Here are my automated test results:\n\n*Project Name:* " + self.settings.projectName + "\n*Suite ID:* " + self.settings.suiteId + "\n*Environment Type:* " + self.settings.environmentType + "\n*Concurrency Limit:* " + self.settings.limitConcurrency + "\n*Total Collections:* " + testResultSummary['collectionsTotalPrintable'] + ", *Collections Passed:* " + testResultSummary['collectionsPassedPrintable'] + ", *Collections Failed:* " + testResultSummary['collectionsFailedPrintable'] + "\n*Total Assertions:* " + testResultSummary['tallyAssertionsTotalPrintable'] + ", *Assertions Passed:* " + testResultSummary['tallyAssertionsPassedPrintable'] + ", *Assertions Failed:* " + testResultSummary['tallyAssertionsFailedPrintable'] + "\n*Run Time:* " + testResultSummary['testDurationTotalPrintable'] + "\n*Test Results:* " + testResultsLink
        slackObject['icon_emoji'] = slackIcon
        slackObject['channel'] = self.settings.slackChannel
        slackObject['username'] = slackUser


        slack.postMessage(slackObject, function resultOfPostMessage(errMsg) {
        if (errMsg) {
            return callback(errMsg)
        } else {
            console.log("success!")
            return callback(null)
        }
        })
    } else {
        return callback(null)
    }
}

*/