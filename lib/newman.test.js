const path = require('node:path')

const createXRunObject = require('./createXRunObject')
const Newman = require('./newman')
const newman = new Newman()


test('run(): validate a successful run', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project2')
    settings['environmentType'] = 'dev1'
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false
    settings['projectName'] = 'test-project'

    const testResultsBasePath = path.join(__dirname, '/unit-tests/test-data/test-project2/throwaway')
    const testResultsProjectPath = path.join(testResultsBasePath, settings.projectName)
    const testResultsProjectHtmlPath = path.join(testResultsProjectPath, 'html', 'test-collection.html')

    const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')

    const path1 = path.join(__dirname, '/unit-tests/test-data/test-project2', 'directory1')
    const directoryList = [
        path1
    ]

    const xRunObject = await createXRunObject(settings, directoryList)

    const collectionResults = await newman.run(settings, xRunObject['postmanCollections'][0], collectionTemplatePath, testResultsProjectHtmlPath)

    //Validate fileNames
    expect(collectionResults).toHaveProperty('testsTotal', 5)
})


test('run(): returns proper error for invalid postmanCollection', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project2')
    settings['environmentType'] = 'dev1'
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false
    settings['projectName'] = 'test-project'

    const testResultsBasePath = path.join(__dirname, '/unit-tests/test-data/test-project2/throwaway')
    const testResultsProjectPath = path.join(testResultsBasePath, settings.projectName)
    const testResultsProjectHtmlPath = path.join(testResultsProjectPath, 'html', 'test-collection.html')

    const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')
    

    await expect(newman.run(settings, {}, collectionTemplatePath, testResultsProjectHtmlPath)).rejects.toThrow(/Oops, newman run resulted in the following error: Error: expecting a collection to run/)
})

test('constructPostmanOptions(): sets iterationData when a data file matches the collection name', async() => {
    const settings = {}
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false

    const dataFilePath = path.join(__dirname, '/unit-tests/test-data/dataFileDirectory/XTEST_DEMO_DATE.csv')
    const postmanCollection = {}
    postmanCollection['collection'] = {"info": {"name": 'XTEST_DEMO_DATE'}}

    const specialNewmanOptions = {}
    specialNewmanOptions['trustedCaCertFilePath'] = null
    specialNewmanOptions['dataFilePathObject'] = {'XTEST_DEMO_DATE': dataFilePath}

    const options = newman.constructPostmanOptions(settings, postmanCollection, specialNewmanOptions)

    expect(options).toHaveProperty('iterationData', dataFilePath)
})


test('constructPostmanOptions(): does NOT set iterationData when no data file matches the collection name', async() => {
    const settings = {}
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false

    const dataFilePath = path.join(__dirname, '/unit-tests/test-data/dataFileDirectory/XTEST_DEMO_DATE.csv')
    const postmanCollection = {}
    postmanCollection['collection'] = {"info": {"name": 'XTEST_DEMO_XML1'}}

    const specialNewmanOptions = {}
    specialNewmanOptions['trustedCaCertFilePath'] = null
    specialNewmanOptions['dataFilePathObject'] = {'XTEST_DEMO_DATE': dataFilePath}

    const options = newman.constructPostmanOptions(settings, postmanCollection, specialNewmanOptions)

    expect(options).not.toHaveProperty('iterationData')
})


test('constructPostmanOptions(): does NOT set iterationData when no dataFilePathObject exists', async() => {
    const settings = {}
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false

    const postmanCollection = {}
    postmanCollection['collection'] = {"info": {"name": 'XTEST_DEMO_DATE'}}

    const specialNewmanOptions = {}
    specialNewmanOptions['trustedCaCertFilePath'] = null

    const options = newman.constructPostmanOptions(settings, postmanCollection, specialNewmanOptions)

    expect(options).not.toHaveProperty('iterationData')
})


test('run(): runs the collection one time per data file row', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project2')
    settings['environmentType'] = 'dev1'
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false
    settings['projectName'] = 'test-project'

    const dataFilePath = path.join(__dirname, '/unit-tests/test-data/dataFileDirectory/XTEST_DEMO_DATE.csv')

    const specialNewmanOptions = {}
    specialNewmanOptions['trustedCaCertFilePath'] = null
    specialNewmanOptions['dataFilePathObject'] = {'XTEST_DEMO_DATE': dataFilePath}

    const path1 = path.join(__dirname, '/unit-tests/test-data/test-project2', 'directory1')
    const directoryList = [
        path1
    ]

    const xRunObject = await createXRunObject(settings, directoryList)

    const collectionResults = await newman.run(settings, xRunObject['postmanCollections'][0], specialNewmanOptions)

    //The XTEST_DEMO_DATE collection has 5 tests and the data file has 3 rows (3 iterations)
    expect(collectionResults).toHaveProperty('iterationsTotal', 3)
    expect(collectionResults).toHaveProperty('dataFilePath', dataFilePath)
    expect(collectionResults).toHaveProperty('testsTotal', 15)
    expect(collectionResults.steps[0]).toHaveProperty('iteration', 1)
    expect(collectionResults.steps[0]).toHaveProperty('iterationLabel', 'Iteration 1 -')
    expect(collectionResults.steps[14]).toHaveProperty('iteration', 3)
})


test('run(): does NOT label iterations when no data file is used', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project2')
    settings['environmentType'] = 'dev1'
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false
    settings['projectName'] = 'test-project'

    const specialNewmanOptions = {}
    specialNewmanOptions['trustedCaCertFilePath'] = null
    specialNewmanOptions['dataFilePathObject'] = {}

    const path1 = path.join(__dirname, '/unit-tests/test-data/test-project2', 'directory1')
    const directoryList = [
        path1
    ]

    const xRunObject = await createXRunObject(settings, directoryList)

    const collectionResults = await newman.run(settings, xRunObject['postmanCollections'][0], specialNewmanOptions)

    expect(collectionResults).toHaveProperty('iterationsTotal', 1)
    expect(collectionResults).toHaveProperty('dataFilePath', undefined)
    expect(collectionResults).toHaveProperty('testsTotal', 5)
    expect(collectionResults.steps[0]).not.toHaveProperty('iterationLabel')
})


test('constructCollectionResults(): only reports a failure against the iteration it occurred in', async() => {
    const buildExecution = function buildExecution(iteration) {
        return {
            "cursor": {"iteration": iteration},
            "item": {"id": 'step-id-1', "name": 'step1'},
            "request": {
                "method": 'GET',
                "url": {"protocol": 'https', "host": ['example', 'com'], "path": ['test'], "query": []},
                "headers": []
            },
            "response": {"code": 200, "status": 'OK', "headers": [], "responseSize": 10, "responseTime": 5},
            "assertions": [{"assertion": 'an assertion'}]
        }
    }

    const summary = {
        "collection": {"name": 'MY_COLLECTION'},
        "run": {
            "executions": [buildExecution(0), buildExecution(1), buildExecution(2)],
            "failures": [
                {
                    "at": 'test-script',
                    "error": {"name": 'Error', "message": 'boom on second row'},
                    "source": {"name": 'step1'},
                    "cursor": {"iteration": 1}
                }
            ],
            "timings": {"started": 0, "completed": 1000, "responseAverage": 5},
            "stats": {"assertions": {"total": 3, "failed": 0}, "iterations": {"total": 3}}
        }
    }

    const collectionResults = newman.constructCollectionResults(summary, '/some/path/MY_COLLECTION.csv')

    expect(collectionResults).toHaveProperty('iterationsTotal', 3)
    expect(collectionResults).toHaveProperty('dataFilePath', '/some/path/MY_COLLECTION.csv')
    expect(collectionResults.steps[0].response.failureMessage).toBeNull()
    expect(collectionResults.steps[1].response.failureMessage).toBe("Error with 'test-script': boom on second row")
    expect(collectionResults.steps[2].response.failureMessage).toBeNull()
    expect(collectionResults.steps[1]).toHaveProperty('iterationLabel', 'Iteration 2 -')
})


test('constructCollectionResults(): properly constructs the request url query string', async() => {
    const summary = {
        "collection": {"name": 'MY_COLLECTION'},
        "run": {
            "executions": [
                {
                    "cursor": {"iteration": 0},
                    "item": {"id": 'step-id-1', "name": 'step1'},
                    "request": {
                        "method": 'GET',
                        "url": {
                            "protocol": 'https',
                            "host": ['example', 'com'],
                            "path": ['test'],
                            "query": [
                                {"key": 'key1', "value": 'value1'},
                                {"key": 'key2', "value": 'value2'},
                                {"key": 'disabledKey', "value": 'disabledValue', "disabled": true},
                                {"key": 'keyWithNoValue', "value": null},
                                {"key": 'keyWithEmptyValue', "value": ''}
                            ]
                        },
                        "headers": []
                    },
                    "response": {"code": 200, "status": 'OK', "headers": [], "responseSize": 10, "responseTime": 5},
                    "assertions": [{"assertion": 'an assertion'}]
                },
                {
                    "cursor": {"iteration": 0},
                    "item": {"id": 'step-id-2', "name": 'step2'},
                    "request": {
                        "method": 'GET',
                        "url": {"protocol": 'https', "host": ['example', 'com'], "path": ['test'], "query": []},
                        "headers": []
                    },
                    "response": {"code": 200, "status": 'OK', "headers": [], "responseSize": 10, "responseTime": 5},
                    "assertions": [{"assertion": 'an assertion'}]
                }
            ],
            "failures": [],
            "timings": {"started": 0, "completed": 1000, "responseAverage": 5},
            "stats": {"assertions": {"total": 2, "failed": 0}, "iterations": {"total": 1}}
        }
    }

    const collectionResults = newman.constructCollectionResults(summary)

    //Query parameters are separated by '&', disabled parameters are excluded and
    //parameters without a value are just the key (matches how Postman sends them)
    expect(collectionResults.steps[0].request.url).toBe('https://example.com/test?key1=value1&key2=value2&keyWithNoValue&keyWithEmptyValue=')

    //No query parameters
    expect(collectionResults.steps[1].request.url).toBe('https://example.com/test')
})


test('constructPostmanOptions(): sets the junit reporter when generateJUnitResults is true', async() => {
    const settings = {}
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false
    settings['generateJUnitResults'] = true

    const postmanCollection = {}
    postmanCollection['collection'] = {"info": {"name": 'MY_COLLECTION'}}

    const specialNewmanOptions = {}
    specialNewmanOptions['trustedCaCertFilePath'] = null
    specialNewmanOptions['testResultsJUnitBasePath'] = path.join('/some/path', 'junit')

    const options = newman.constructPostmanOptions(settings, postmanCollection, specialNewmanOptions)

    expect(options['reporters']).toEqual(['junit'])
    expect(options['reporter']['junit']).toHaveProperty('export', path.join('/some/path', 'junit', 'MY_COLLECTION.xml'))
})


test('constructPostmanOptions(): sets sslExtraCaCerts when a trustedCaCertFilePath is provided', async() => {
    const settings = {}
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = true

    const postmanCollection = {}
    postmanCollection['collection'] = {"info": {"name": 'MY_COLLECTION'}}

    const specialNewmanOptions = {}
    specialNewmanOptions['trustedCaCertFilePath'] = '/some/path/ca.pem'

    const options = newman.constructPostmanOptions(settings, postmanCollection, specialNewmanOptions)

    expect(options).toHaveProperty('sslExtraCaCerts', '/some/path/ca.pem')
    expect(options).toHaveProperty('timeout', 10000)
    expect(options).toHaveProperty('ignoreRedirects', true)
    expect(options).not.toHaveProperty('reporters')
})


test('constructPostmanOptions(): does NOT set iterationData when the collection has no info', async() => {
    const settings = {}
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false

    const specialNewmanOptions = {}
    specialNewmanOptions['trustedCaCertFilePath'] = null
    specialNewmanOptions['dataFilePathObject'] = {'MY_COLLECTION': '/some/path/MY_COLLECTION.csv'}

    //A collection object without an 'info' property
    const options = newman.constructPostmanOptions(settings, {"collection": {}}, specialNewmanOptions)

    expect(options).not.toHaveProperty('iterationData')
})
