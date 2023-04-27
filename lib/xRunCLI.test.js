const path = require('node:path')

const getXRunDirectoryList = require('./getXRunDirectoryList')
const createXRunObject = require('./createXRunObject')
const xRunCLI = require('./xRunCLI')
const cli = new xRunCLI()


test('getUsage(): properly returns usage', () => {
    const expectedTitleAndVersion = new RegExp(`xRun Ver. `)
    expect(cli.getUsage()).toMatch(expectedTitleAndVersion)

    const expectedAppName = new RegExp(`xrun`)
    expect(cli.getUsage()).toMatch(expectedAppName)
})


test('getCollectionInfo(): properly returns collectionInfoString', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project1')
    settings['projectName'] = 'test-project'
    settings['xRunProjectDirectoryName'] = 'xrun'
    const directoryList = await getXRunDirectoryList(settings)

    const xRunObject = await createXRunObject(settings, directoryList)

    const collectionInfoString = await cli.getCollectionInfo(settings, xRunObject)

    expect(collectionInfoString).toContain(`projectName: ${settings['projectName']}`)
    expect(collectionInfoString).toContain(`1 XTEST_DEMO_DATE                                                                             5 directory1`)
    expect(collectionInfoString).toContain(`28 XTEST_DEMO_XML2                                                                             1 directory3`)
})


test('getTestOutputHeader(): properly returns header', () => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project1')
    settings['projectName'] = 'test-project'
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['environmentType'] = 'unt1'
    settings['limitConcurrency'] = 8
    settings['timeoutCollection'] = 1000
    settings['timeoutRequest'] = 1000
    settings['timeoutScript'] = 1000

    const xRunObject = {}
    xRunObject['postmanCollections'] = [
        "one",
        "two",
        "three",
        "four"
    ]

    const testOutputHeader = cli.getTestOutputHeader(settings, xRunObject)

    expect(testOutputHeader).toContain(`xRun Version `)
    expect(testOutputHeader).toContain(`Project Name: test-project`)
    expect(testOutputHeader).toContain(`Total Number of Collections to Run: 4`)
    expect(testOutputHeader).toContain(`Environment Type: unt1`)
    expect(testOutputHeader).toContain(`Concurrency Limit: 8`)
    expect(testOutputHeader).toContain(`Script Time Out: 1000 ms`)
})


test('getTestOutputResult(): properly returns result passed', () => {
    const collectionCompleteCounter = 5

    const collectionResults = {}
    collectionResults['collectionName'] = 'UNIT_TEST_SOME_COLLECTION_NAME_P'
    collectionResults['collectionResult'] = 'passed'
    collectionResults['executionTimeTotalPrintable'] = '10 sec'
    collectionResults['testsTotalPrintable'] = '20'
    collectionResults['testsPassedPrintable'] = '20'
    collectionResults['testsFailedPrintable'] = '0'
    collectionResults['assertionsTotalPrintable'] = '100'
    collectionResults['assertionsPassedPrintable'] = '100'
    collectionResults['assertionsFailedPrintable'] = '0'

    const testOutputResult = cli.getTestOutputResult(collectionCompleteCounter, collectionResults)

    expect(testOutputResult).toContain(`5 UNIT_TEST_SOME_COLLECTION_NAME_P`)
    expect(testOutputResult).toContain(`10 sec    20      20      0       100         100         0`)
    expect(testOutputResult).toContain(`passed`)
})


test('getTestOutputResult(): properly returns result failed', () => {
    const collectionCompleteCounter = 5

    const collectionResults = {}
    collectionResults['collectionName'] = 'UNIT_TEST_SOME_COLLECTION_NAME_P'
    collectionResults['collectionResult'] = 'failed'
    collectionResults['executionTimeTotalPrintable'] = '10 sec'
    collectionResults['testsTotalPrintable'] = '20'
    collectionResults['testsPassedPrintable'] = '19'
    collectionResults['testsFailedPrintable'] = '1'
    collectionResults['assertionsTotalPrintable'] = '100'
    collectionResults['assertionsPassedPrintable'] = '90'
    collectionResults['assertionsFailedPrintable'] = '10'

    const testOutputResult = cli.getTestOutputResult(collectionCompleteCounter, collectionResults)

    expect(testOutputResult).toContain(`5 UNIT_TEST_SOME_COLLECTION_NAME_P`)
    expect(testOutputResult).toContain(`10 sec    20      19      1       100         90          10`)
    expect(testOutputResult).toContain(`failed`)
})


test('getTestOutputFooter(): properly returns footer for passed', () => {

    const testResultSummary = {}
    testResultSummary['collectionsFailed'] = 0
    testResultSummary['collectionsTotalPrintable'] = '20'
    testResultSummary['collectionsPassedPrintable'] = '20'
    testResultSummary['collectionsFailedPrintable'] = '0'
    testResultSummary['tallyTestsTotalPrintable'] = '100'
    testResultSummary['tallyTestsPassedPrintable'] = '100'
    testResultSummary['tallyTestsFailedPrintable'] = '0'
    testResultSummary['tallyAssertionsTotalPrintable'] = '1000'
    testResultSummary['tallyAssertionsPassedPrintable'] = '1000'
    testResultSummary['tallyAssertionsFailedPrintable'] = '0'
    testResultSummary['testDurationTotalPrintable'] = '1 minute 4 seconds'

    const testOutputFooter = cli.getTestOutputFooter(testResultSummary)

    expect(testOutputFooter).toContain(`Total Collections: 20`)
    expect(testOutputFooter).toContain(`Total Run Time: 1 minute 4 seconds`)
    expect(testOutputFooter).toContain(`PASSED`)
})


test('getTestOutputFooter(): properly returns footer for failed', () => {

    const testResultSummary = {}
    testResultSummary['collectionsFailed'] = 3
    testResultSummary['collectionsTotalPrintable'] = '20'
    testResultSummary['collectionsPassedPrintable'] = '17'
    testResultSummary['collectionsFailedPrintable'] = '3'
    testResultSummary['tallyTestsTotalPrintable'] = '100'
    testResultSummary['tallyTestsPassedPrintable'] = '90'
    testResultSummary['tallyTestsFailedPrintable'] = '10'
    testResultSummary['tallyAssertionsTotalPrintable'] = '1000'
    testResultSummary['tallyAssertionsPassedPrintable'] = '985'
    testResultSummary['tallyAssertionsFailedPrintable'] = '15'
    testResultSummary['testDurationTotalPrintable'] = '1 minute 28 seconds'

    const testOutputFooter = cli.getTestOutputFooter(testResultSummary)

    expect(testOutputFooter).toContain(`Total Collections: 20`)
    expect(testOutputFooter).toContain(`Total Run Time: 1 minute 28 seconds`)
    expect(testOutputFooter).toContain(`FAILED`)
})