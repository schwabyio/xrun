const path = require('node:path')

const createXRunObject = require('./createXRunObject')
const Newman = require('./newman')
const newman = new Newman()


test('run(): validate a successful run', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project2')
    settings['environmentType'] = 'dev1'
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false
    settings['projectName'] = 'test-project'

    const testResultsBasePath = path.join(__dirname, '/unit-tests/test-data/test-suites-project2/throwaway')
    const testResultsProjectPath = path.join(testResultsBasePath, settings.projectName)
    const testResultsProjectHtmlPath = path.join(testResultsProjectPath, 'html', 'test-collection.html')

    const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')

    const path1 = path.join(__dirname, '/unit-tests/test-data/test-suites-project2', 'directory1')
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
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project2')
    settings['environmentType'] = 'dev1'
    settings['timeoutCollection'] = 10000
    settings['timeoutRequest'] = 10000
    settings['timeoutScript'] = 10000
    settings['ignoreRedirects'] = false
    settings['projectName'] = 'test-project'

    const testResultsBasePath = path.join(__dirname, '/unit-tests/test-data/test-suites-project2/throwaway')
    const testResultsProjectPath = path.join(testResultsBasePath, settings.projectName)
    const testResultsProjectHtmlPath = path.join(testResultsProjectPath, 'html', 'test-collection.html')

    const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')
    

    await expect(newman.run(settings, {}, collectionTemplatePath, testResultsProjectHtmlPath)).rejects.toThrow(/Oops, newman run resulted in the following error: Error: expecting a collection to run/)
})