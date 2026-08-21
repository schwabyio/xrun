const path = require('node:path')

const getDataFilePathObject = require('./getDataFilePathObject')

test('successfully returns a dataFilePathObject of all data files', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project6')
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['dataFileDirectoryPath'] = 'data'
    const dataFilePathObject = await getDataFilePathObject(settings)

    expect(Object.keys(dataFilePathObject)).toHaveLength(2)
    expect(dataFilePathObject['XTEST_DEMO_XML1']).toContain('unit-tests/test-data/test-project6/xrun/data/XTEST_DEMO_XML1.csv')
    expect(dataFilePathObject['XTEST_DEMO_XML2']).toContain('unit-tests/test-data/test-project6/xrun/data/XTEST_DEMO_XML2.json')
})


test('unsupported data file types are ignored', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project6')
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['dataFileDirectoryPath'] = 'data'
    const dataFilePathObject = await getDataFilePathObject(settings)

    expect(dataFilePathObject).not.toHaveProperty('notes')
})


test('No error occurs when dataFileDirectoryPath does NOT exist and an empty dataFilePathObject is returned', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project3')
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['dataFileDirectoryPath'] = 'data'
    const dataFilePathObject = await getDataFilePathObject(settings)

    expect(dataFilePathObject).toEqual({})
})


test('successfully returns a dataFilePathObject when using a custom dataFileDirectoryPath', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project7')
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['dataFileDirectoryPath'] = 'customDataDirectory'
    const dataFilePathObject = await getDataFilePathObject(settings)

    expect(dataFilePathObject['XTEST_DEMO_XML1']).toContain('unit-tests/test-data/test-project7/xrun/customDataDirectory/XTEST_DEMO_XML1.csv')
})


test('successfully returns a dataFilePathObject when using an absolute path for dataFileDirectoryPath', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project6')
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['dataFileDirectoryPath'] = path.join(__dirname, '/unit-tests/test-data/dataFileDirectory')
    const dataFilePathObject = await getDataFilePathObject(settings)

    expect(dataFilePathObject['XTEST_DEMO_DATE']).toContain('/unit-tests/test-data/dataFileDirectory/XTEST_DEMO_DATE.csv')
})


test('Warns but does NOT throw when a custom dataFileDirectoryPath does not exist', async() => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    try {
        const settings = {}
        settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project6')
        settings['xRunProjectDirectoryName'] = 'xrun'
        settings['dataFileDirectoryPath'] = 'thisDirectoryDoesNotExist'
        const dataFilePathObject = await getDataFilePathObject(settings)

        expect(dataFilePathObject).toEqual({})
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/WARNING: unable to getDataFilePathObject\(\): ENOENT /))
    } finally {
        consoleLogSpy.mockRestore()
    }
})


test('properly returns an empty dataFilePathObject when the directory has NO data files', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project6')
    settings['xRunProjectDirectoryName'] = 'xrun'
    //The 'trustedCaCert' directory exists but only contains a .pem file
    settings['dataFileDirectoryPath'] = 'trustedCaCert'
    const dataFilePathObject = await getDataFilePathObject(settings)

    expect(dataFilePathObject).toEqual({})
})
