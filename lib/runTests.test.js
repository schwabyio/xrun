const path = require('node:path')
const { readdir, readFile } = require('node:fs/promises')

const { rimraf } = require('rimraf')

//Mock newman so no postman tests are actually run. A mock result that is an Error
//is thrown, which is how a collection that can not be run behaves.
jest.mock('./newman', () => {
    const ActualNewman = jest.requireActual('./newman')

    return jest.fn().mockImplementation(() => {
        const actualNewman = new ActualNewman()

        return {
            run: jest.fn().mockImplementation(async (settings, postmanCollection) => {
                const mockCollectionResults = global.__mockCollectionResults[postmanCollection.collection.info.name]

                if (mockCollectionResults instanceof Error) {
                    throw mockCollectionResults
                }

                return mockCollectionResults
            }),
            //Use the real implementation so the error results shape is validated
            constructErrorCollectionResults: actualNewman.constructErrorCollectionResults
        }
    })
})

const runTests = require('./runTests')
const tests = new runTests()

const testProject8Path = path.join(__dirname, '/unit-tests/test-data/test-project8')
const throwawayResultsPath = path.join(testProject8Path, 'throwaway-test-results')


const buildCollectionResults = function buildCollectionResults(collectionName, collectionResult) {
    const failed = (collectionResult === 'failed')

    return {
        "collectionName": collectionName,
        "collectionResult": collectionResult,
        "collectionPassed": !failed,
        "executionTimeTotalPrintable": '1.5s',
        "testsTotal": 5,
        "testsTotalPrintable": '5',
        "testsPassed": failed ? 4 : 5,
        "testsPassedPrintable": failed ? '4' : '5',
        "testsFailed": failed ? 1 : 0,
        "testsFailedPrintable": failed ? '1' : '0',
        "assertionsTotal": 10,
        "assertionsTotalPrintable": '10',
        "assertionsPassed": failed ? 9 : 10,
        "assertionsPassedPrintable": failed ? '9' : '10',
        "assertionsFailed": failed ? 1 : 0,
        "assertionsFailedPrintable": failed ? '1' : '0',
        "steps": []
    }
}


const buildXRunObject = function buildXRunObject(collectionNameList) {
    const xRunObject = {}
    xRunObject['xtestVersion'] = '1.6.0'
    xRunObject['postmanCollections'] = collectionNameList.map(function (collectionName) {
        return {"collection": {"info": {"name": collectionName}}}
    })

    return xRunObject
}


const buildSettings = function buildSettings() {
    const settings = {}
    settings['xRunProjectPath'] = testProject8Path
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['environmentType'] = 'dev1'
    settings['projectName'] = 'test-project8'
    settings['limitConcurrency'] = 2
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['trustedCaCertDirectoryPath'] = 'trustedCaCert'
    settings['dataFileDirectoryPath'] = 'data'
    settings['testResultsBasePath'] = ''
    settings['autoOpenTestResultHtml'] = false
    settings['sendSummaryResultsToSlack'] = false

    return settings
}


let stdoutSpy

beforeEach(() => {
    //Keep the test output clean
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
})

afterEach(() => {
    stdoutSpy.mockRestore()
})

afterAll(async () => {
    await rimraf(throwawayResultsPath)
})


test('determineTestResultsBasePath(): properly returns settings.testResultsBasePath when it is set', async() => {
    const settings = buildSettings()
    settings['testResultsBasePath'] = '/some/configured/path'

    expect(tests.determineTestResultsBasePath(settings, '/the/default/path')).toBe('/some/configured/path')
})


test('determineTestResultsBasePath(): properly returns the default path when settings.testResultsBasePath is empty', async() => {
    const settings = buildSettings()

    expect(tests.determineTestResultsBasePath(settings, '/the/default/path')).toBe('/the/default/path')
})


test('run(): properly returns PASSED when all collections pass', async() => {
    global.__mockCollectionResults = {
        "COLLECTION_1": buildCollectionResults('COLLECTION_1', 'passed'),
        "COLLECTION_2": buildCollectionResults('COLLECTION_2', 'passed')
    }

    const testFinalResult = await tests.run(buildSettings(), buildXRunObject(['COLLECTION_1', 'COLLECTION_2']), throwawayResultsPath)

    expect(testFinalResult).toBe('PASSED')
})


test('run(): properly returns FAILED when at least one collection fails', async() => {
    global.__mockCollectionResults = {
        "COLLECTION_1": buildCollectionResults('COLLECTION_1', 'passed'),
        "COLLECTION_2": buildCollectionResults('COLLECTION_2', 'failed')
    }

    const testFinalResult = await tests.run(buildSettings(), buildXRunObject(['COLLECTION_1', 'COLLECTION_2']), throwawayResultsPath)

    expect(testFinalResult).toBe('FAILED')
})


test('run(): properly creates an html report for every collection plus a summary report', async() => {
    global.__mockCollectionResults = {
        "COLLECTION_1": buildCollectionResults('COLLECTION_1', 'passed'),
        "COLLECTION_2": buildCollectionResults('COLLECTION_2', 'failed')
    }

    await tests.run(buildSettings(), buildXRunObject(['COLLECTION_1', 'COLLECTION_2']), throwawayResultsPath)

    const htmlFileList = await readdir(path.join(throwawayResultsPath, 'test-project8', 'html'))

    expect(htmlFileList).toHaveLength(3)
    expect(htmlFileList).toContain('COLLECTION_1.html')
    expect(htmlFileList).toContain('COLLECTION_2.html')
    expect(htmlFileList).toContain('summary.html')
})


test('run(): returns proper error when the test results directory can NOT be created', async() => {
    global.__mockCollectionResults = {
        "COLLECTION_1": buildCollectionResults('COLLECTION_1', 'passed')
    }

    //A file (not a directory) can not be used as the test results base path
    const badTestResultsBasePath = path.join(testProject8Path, 'xrun', 'settings.json')

    await expect(tests.run(buildSettings(), buildXRunObject(['COLLECTION_1']), badTestResultsBasePath)).rejects.toThrow(/Oops, got an error trying to create the following test results directory path /)
})



test('runPostmanCollection(): properly returns failed collection results when the collection can NOT be run', async() => {
    global.__mockCollectionResults = {
        "COLLECTION_1": new Error('Oops, newman run resulted in the following error: Error: expecting a collection to run')
    }

    const postmanCollection = {"collection": {"info": {"name": 'COLLECTION_1'}}}

    const collectionResults = await tests.runPostmanCollection(buildSettings(), postmanCollection, {})

    expect(collectionResults).toHaveProperty('collectionName', 'COLLECTION_1')
    expect(collectionResults).toHaveProperty('collectionResult', 'failed')
    expect(collectionResults.errorMessage).toMatch(/expecting a collection to run/)
})


test('runPostmanCollection(): properly names the collection when it can NOT be identified', async() => {
    global.__mockCollectionResults = {}

    //A collection object without an 'info' property can not be identified by name
    const postmanCollection = {"collection": {}}

    const collectionResults = await tests.runPostmanCollection(buildSettings(), postmanCollection, {})

    expect(collectionResults).toHaveProperty('collectionName', 'UNKNOWN COLLECTION')
    expect(collectionResults).toHaveProperty('collectionResult', 'failed')
})


test('run(): properly returns FAILED when a collection can NOT be run', async() => {
    global.__mockCollectionResults = {
        "COLLECTION_1": buildCollectionResults('COLLECTION_1', 'passed'),
        "COLLECTION_2": new Error('Oops, newman run resulted in the following error: Error: expecting a collection to run')
    }

    const testFinalResult = await tests.run(buildSettings(), buildXRunObject(['COLLECTION_1', 'COLLECTION_2']), throwawayResultsPath)

    //A collection that errors must NOT be silently reported as passing
    expect(testFinalResult).toBe('FAILED')
})


test('run(): properly writes an html report naming the collection that could NOT be run', async() => {
    global.__mockCollectionResults = {
        "COLLECTION_1": buildCollectionResults('COLLECTION_1', 'passed'),
        "COLLECTION_2": new Error('Oops, newman run resulted in the following error: Error: expecting a collection to run')
    }

    await tests.run(buildSettings(), buildXRunObject(['COLLECTION_1', 'COLLECTION_2']), throwawayResultsPath)

    const htmlFileList = await readdir(path.join(throwawayResultsPath, 'test-project8', 'html'))

    //The report must be named after the collection (not 'undefined.html')
    expect(htmlFileList).toContain('COLLECTION_2.html')
    expect(htmlFileList).not.toContain('undefined.html')

    const collectionHtmlReport = (await readFile(path.join(throwawayResultsPath, 'test-project8', 'html', 'COLLECTION_2.html'))).toString()
    expect(collectionHtmlReport).toContain('expecting a collection to run')

    const summaryHtmlReport = (await readFile(path.join(throwawayResultsPath, 'test-project8', 'html', 'summary.html'))).toString()
    expect(summaryHtmlReport).toContain('COLLECTION_2')
})


test('run(): properly tallies a collection that could NOT be run as zero tests', async() => {
    global.__mockCollectionResults = {
        "COLLECTION_1": buildCollectionResults('COLLECTION_1', 'passed'),
        "COLLECTION_2": new Error('Oops, newman run resulted in the following error: Error: expecting a collection to run')
    }

    await tests.run(buildSettings(), buildXRunObject(['COLLECTION_1', 'COLLECTION_2']), throwawayResultsPath)

    const summaryHtmlReport = (await readFile(path.join(throwawayResultsPath, 'test-project8', 'html', 'summary.html'))).toString()

    //Only the 5 tests of COLLECTION_1 ran, and 1 of the 2 collections failed
    expect(summaryHtmlReport).toContain('>5<')
    expect(summaryHtmlReport).not.toContain('NaN')
})


test('createCollectionHtmlReport(): warns but does NOT throw when the report can not be written', async() => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    try {
        const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')
        const badHtmlPath = path.join(throwawayResultsPath, 'this-directory-does-not-exist', 'COLLECTION_1.html')

        await expect(tests.createCollectionHtmlReport(collectionTemplatePath, buildCollectionResults('COLLECTION_1', 'passed'), badHtmlPath)).resolves.not.toThrow()

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/WARNING: Oops, unable to write collection html report to /))
    } finally {
        consoleLogSpy.mockRestore()
    }
})
