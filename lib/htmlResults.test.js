const path = require('node:path')
const { readFile, mkdir } = require('node:fs/promises')

const { rimraf } = require('rimraf')

//Mock open so a web browser is never launched by a test
jest.mock('open', () => jest.fn())
const open = require('open')

const htmlResults = require('./htmlResults')
const html = new htmlResults()

const throwawayPath = path.join(__dirname, 'unit-tests', 'test-data', 'test-project8', 'throwaway-html')
const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')
const summaryTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-summary.hbs')

beforeAll(async () => {
    await mkdir(throwawayPath, { recursive: true })
})

afterAll(async () => {
    await rimraf(throwawayPath)
})

test('getCollectionHtmlReport(): properly gets collectionHtmlReport for a valid collectionTemplatePath', async() => {
    const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')
    const collectionResults = {}
    const collectionHtmlReport = await html.getCollectionHtmlReport(collectionTemplatePath, collectionResults)

    expect(collectionHtmlReport).toContain('</html>')
})


test('getCollectionHtmlReport(): returns proper error for invalid collectionTemplatePath', async() => {
    const collectionTemplatePath = path.join(__dirname, 'does-not-exist', 'template-xrun-collection.hbs')
    const collectionResults = {}
    

    await expect(html.getCollectionHtmlReport(collectionTemplatePath, collectionResults)).rejects.toThrow(/Oops, unable to read collection template file /)
})


test('getSummaryHtmlReport(): properly gets summaryHtmlReport for a valid summaryTemplatePath', async() => {
    const summaryTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-summary.hbs')
    const testResultSummary = {}
    const summaryHtmlReport = await html.getSummaryHtmlReport(summaryTemplatePath, testResultSummary)

    expect(summaryHtmlReport).toContain('</html>')
})


test('getSummaryHtmlReport(): returns proper error for invalid summaryTemplatePath', async() => {
    const summaryTemplatePath = path.join(__dirname, 'does-not-exist', 'template-xrun-summary.hbs')
    const testResultSummary = {}
    

    await expect(html.getSummaryHtmlReport(summaryTemplatePath, testResultSummary)).rejects.toThrow(/Oops, unable to read summary template file /)
})


test('createCollectionHtmlReport(): properly writes the collection html report', async() => {
    const collectionHtmlPath = path.join(throwawayPath, 'MY_COLLECTION.html')
    const collectionResults = {
        "collectionName": 'MY_COLLECTION',
        "collectionDescriptionHtml": '<p>A collection used by unit tests.</p>',
        "dateTimeOfRunPrintable": 'Mon, October 20, 2025',
        "executionTimeTotalPrintable": '1.5s',
        "stepsPassed": 1,
        "stepsFailed": 1,
        "assertionsTotalPrintable": '2',
        "assertionsPassedPrintable": '1',
        "assertionsFailedPrintable": '1',
        "collectionPassed": false,
        "dataFilePath": '/some/path/MY_COLLECTION.csv',
        "iterationsTotal": 2,
        "steps": [
            {
                "name": 'step1',
                "iterationLabel": 'Iteration 1 -',
                "stepResult": 'passed',
                "request": {"method": 'GET', "url": 'https://example.com/test', "headersHtml": 'Accept: application/json', "body": '{"name":"xrun"}', "bodyHtmlEscaped": '{"name":"xrun"}'},
                "response": {"code": 200, "status": 'OK', "headersHtml": 'Content-Type: application/json', "body": '{"id":123}', "bodyHtmlEscaped": '{"id":123}', "responseSize": 100, "responseTime": 25, "failureMessage": null},
                "assertions": {"passedCount": 1, "failedCount": 0, "totalCount": 1, "list": [{"passed": true, "assertionResult": 'passed', "assertionDetail": 'an assertion'}]}
            },
            {
                "name": 'step2',
                "iterationLabel": 'Iteration 2 -',
                "stepResult": 'failed',
                "request": {"method": 'GET', "url": 'https://example.com/test', "headersHtml": '', "body": undefined, "bodyHtmlEscaped": undefined},
                "response": {"code": 500, "status": 'Internal Server Error', "headersHtml": '', "body": '', "bodyHtmlEscaped": '', "responseSize": 0, "responseTime": 5, "failureMessage": "Error with 'test-script': boom"},
                "assertions": {"passedCount": 0, "failedCount": 1, "totalCount": 1, "list": [{"passed": false, "assertionResult": 'failed', "assertionDetail": 'a failing assertion', "failureName": 'AssertionError', "failureMessage": 'expected 1 to equal 2'}]}
            }
        ]
    }

    await html.createCollectionHtmlReport(collectionTemplatePath, collectionResults, collectionHtmlPath)

    const collectionHtmlReport = (await readFile(collectionHtmlPath)).toString()

    expect(collectionHtmlReport).toContain('MY_COLLECTION')
    expect(collectionHtmlReport).toContain('Test 1: Iteration 1 - step1')
    expect(collectionHtmlReport).toContain('Test 2: Iteration 2 - step2')
    expect(collectionHtmlReport).toContain('/some/path/MY_COLLECTION.csv')
    expect(collectionHtmlReport).toContain('a failing assertion')
    expect(collectionHtmlReport).toContain("Error with 'test-script': boom")
    expect(collectionHtmlReport).toContain('</html>')
})


test('writeCollectionHtmlReport(): returns proper error for a path that can NOT be written to', async() => {
    const collectionHtmlPath = path.join(throwawayPath, 'this-directory-does-not-exist', 'MY_COLLECTION.html')

    await expect(html.writeCollectionHtmlReport(collectionHtmlPath, '<html></html>')).rejects.toThrow(/Oops, unable to write collection html report to /)
})


test('createSummaryHtmlReport(): properly writes the summary html report', async() => {
    const summaryHtmlPath = path.join(throwawayPath, 'summary.html')
    const settings = {"autoOpenTestResultHtml": false}
    const testResultSummary = {
        "projectName": 'test-project8',
        "environmentType": 'dev1',
        "testFinalResult": 'FAILED',
        "concurrencyLimit": 2,
        "dateTimeOfRunPrintable": 'Mon, October 20, 2025',
        "testDurationTotalPrintable": '5 seconds',
        "collectionsTotalPrintable": '2',
        "collectionsPassedPrintable": '1',
        "collectionsFailedPrintable": '1',
        "tallyTestsTotalPrintable": '10',
        "tallyTestsPassedPrintable": '9',
        "tallyTestsFailedPrintable": '1',
        "tallyAssertionsTotalPrintable": '20',
        "tallyAssertionsPassedPrintable": '19',
        "tallyAssertionsFailedPrintable": '1',
        "collectionResults": [
            {"collectionName": 'MY COLLECTION 1', "collectionResult": 'passed', "executionTimeTotalPrintable": '1.5s', "testsTotalPrintable": '5', "testsPassedPrintable": '5', "testsFailedPrintable": '0', "assertionsTotalPrintable": '10', "assertionsPassedPrintable": '10', "assertionsFailedPrintable": '0'},
            {"collectionName": 'MY_COLLECTION_2', "collectionResult": 'failed', "executionTimeTotalPrintable": '2.5s', "testsTotalPrintable": '5', "testsPassedPrintable": '4', "testsFailedPrintable": '1', "assertionsTotalPrintable": '10', "assertionsPassedPrintable": '9', "assertionsFailedPrintable": '1'}
        ]
    }

    await html.createSummaryHtmlReport(settings, summaryTemplatePath, testResultSummary, summaryHtmlPath)

    const summaryHtmlReport = (await readFile(summaryHtmlPath)).toString()

    expect(summaryHtmlReport).toContain('test-project8')

    //The collection name is uri encoded for the report link
    expect(summaryHtmlReport).toContain('href="MY%20COLLECTION%201.html"')
    expect(summaryHtmlReport).toContain('MY_COLLECTION_2')
    expect(summaryHtmlReport).toContain('</html>')

    //autoOpenTestResultHtml is false, so the report must NOT be opened
    expect(open).not.toHaveBeenCalled()
})


test('writeSummaryHtmlReport(): properly opens the report when autoOpenTestResultHtml is true', async() => {
    const summaryHtmlPath = path.join(throwawayPath, 'summary-auto-open.html')
    const settings = {"autoOpenTestResultHtml": true}

    await html.writeSummaryHtmlReport(settings, summaryHtmlPath, '<html></html>')

    expect(open).toHaveBeenCalledWith(summaryHtmlPath)
})


test('writeSummaryHtmlReport(): returns proper error for a path that can NOT be written to', async() => {
    const summaryHtmlPath = path.join(throwawayPath, 'this-directory-does-not-exist', 'summary.html')
    const settings = {"autoOpenTestResultHtml": false}

    await expect(html.writeSummaryHtmlReport(settings, summaryHtmlPath, '<html></html>')).rejects.toThrow(/Oops, unable to write html summary to /)
})
