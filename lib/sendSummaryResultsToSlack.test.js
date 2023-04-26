const sendSummaryResultsToSlack = require('./sendSummaryResultsToSlack')

test('properly skips with settings.sendSummaryResultsToSlack set to false', async() => {
    const settings = {}
    settings['sendSummaryResultsToSlack'] = false
    const testResultSummary = {}
    const testResultsUrl = 'N/A'

    const result = await sendSummaryResultsToSlack(settings, testResultSummary, testResultsUrl)

    expect(result).toBe("SKIPPED")
})


test('properly throws error for bad token', async() => {
    const settings = {}
    settings['sendSummaryResultsToSlack'] = true
    settings['slackToken'] = "12345"
    const testResultSummary = {}
    const testResultsUrl = 'N/A'
    

    await expect(sendSummaryResultsToSlack(settings, testResultSummary, testResultsUrl)).rejects.toThrow(/Oops, got the following error trying to post a slack message: An API error occurred: invalid_auth/)
})