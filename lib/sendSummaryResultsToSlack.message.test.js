//Mock slack so no slack message is actually posted
jest.mock('./slack', () => {
    return jest.fn().mockImplementation(() => {
        return {
            postMessage: jest.fn().mockImplementation(async (slackObject) => {
                global.__lastSlackObject = slackObject

                return {"ok": true}
            })
        }
    })
})

const sendSummaryResultsToSlack = require('./sendSummaryResultsToSlack')

const buildSettings = function buildSettings() {
    const settings = {}
    settings['sendSummaryResultsToSlack'] = true
    settings['slackToken'] = 'xoxb-not-a-real-token'
    settings['slackChannel'] = 'C00000000'
    settings['slackIconTestsPass'] = ':pass:'
    settings['slackIconTestsFail'] = ':fail:'
    settings['slackHardAlertOnSuccess'] = false
    settings['slackHardAlertOnFailure'] = false
    settings['projectName'] = 'test-project8'
    settings['environmentType'] = 'dev1'
    settings['limitConcurrency'] = 2

    return settings
}

const buildTestResultSummary = function buildTestResultSummary(testFinalResult) {
    return {
        "testFinalResult": testFinalResult,
        "collectionsTotalPrintable": '2',
        "collectionsPassedPrintable": testFinalResult === 'PASSED' ? '2' : '1',
        "collectionsFailedPrintable": testFinalResult === 'PASSED' ? '0' : '1',
        "tallyAssertionsTotalPrintable": '10',
        "tallyAssertionsPassedPrintable": '10',
        "tallyAssertionsFailedPrintable": '0',
        "testDurationTotalPrintable": '5 seconds'
    }
}

let consoleLogSpy
let stdoutSpy

beforeEach(() => {
    global.__lastSlackObject = undefined

    //Keep the test output clean
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
})

afterEach(() => {
    consoleLogSpy.mockRestore()
    stdoutSpy.mockRestore()
})


test('properly posts a PASSED slack message', async() => {
    const result = await sendSummaryResultsToSlack(buildSettings(), buildTestResultSummary('PASSED'), undefined)

    expect(result).toBe('OK')
    expect(global.__lastSlackObject).toHaveProperty('icon_emoji', ':pass:')
    expect(global.__lastSlackObject).toHaveProperty('username', 'test-project8 - PASSED')
    expect(global.__lastSlackObject).toHaveProperty('channel', 'C00000000')
    expect(global.__lastSlackObject.text).toContain('*Project Name:* test-project8')

    //No testResultsUrl was provided
    expect(global.__lastSlackObject.text).toContain('*Test Results:* Not Available')

    //No hard alert was configured
    expect(global.__lastSlackObject.text).not.toContain('<!channel>')
})


test('properly posts a FAILED slack message', async() => {
    const result = await sendSummaryResultsToSlack(buildSettings(), buildTestResultSummary('FAILED'), undefined)

    expect(result).toBe('OK')
    expect(global.__lastSlackObject).toHaveProperty('icon_emoji', ':fail:')
    expect(global.__lastSlackObject).toHaveProperty('username', 'test-project8 - FAILED')
})


test('properly sends a hard alert on success when slackHardAlertOnSuccess is true', async() => {
    const settings = buildSettings()
    settings['slackHardAlertOnSuccess'] = true

    await sendSummaryResultsToSlack(settings, buildTestResultSummary('PASSED'), undefined)

    expect(global.__lastSlackObject.text).toContain('<!channel>')
})


test('properly sends a hard alert on failure when slackHardAlertOnFailure is true', async() => {
    const settings = buildSettings()
    settings['slackHardAlertOnFailure'] = true

    await sendSummaryResultsToSlack(settings, buildTestResultSummary('FAILED'), undefined)

    expect(global.__lastSlackObject.text).toContain('<!channel>')
})


test('properly includes a link when a testResultsUrl is provided', async() => {
    await sendSummaryResultsToSlack(buildSettings(), buildTestResultSummary('PASSED'), 'https://example.com/results')

    expect(global.__lastSlackObject.text).toContain('*Test Results:* <https://example.com/results|Click Here>')
})
