const path = require('node:path')

const getTrustedCaCertFilePath = require('./getTrustedCaCertFilePath')

test('successfully returns a path to a trustedCaCertFile', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project6')
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['trustedCaCertDirectoryPath'] = 'trustedCaCert'
    const trustedCaCertFilePath = await getTrustedCaCertFilePath(settings)

    expect(trustedCaCertFilePath).toContain('unit-tests/test-data/test-project6/xrun/trustedCaCert/successfulCaCert.pem')
})


test('No error occurs when trustedCaCertDirectoryPath does NOT exist and trustedCaCertFilePath === null', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project3')
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['trustedCaCertDirectoryPath'] = 'trustedCaCert'
    const trustedCaCertFilePath = await getTrustedCaCertFilePath(settings)

    expect(trustedCaCertFilePath).toBeNull()
})

test('successfully returns a path to a trustedCaCertFile when using a custom trustedCaCertDirectoryPath', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project7')
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['trustedCaCertDirectoryPath'] = 'customTrustedCaCertDirectory'
    const trustedCaCertFilePath = await getTrustedCaCertFilePath(settings)

    expect(trustedCaCertFilePath).toContain('unit-tests/test-data/test-project7/xrun/customTrustedCaCertDirectory/successfulCaCert.pem')
})


test('successfully returns a path to a trustedCaCertFile when using an absolute path for trustedCaCertDirectoryPath', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project6')
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['trustedCaCertDirectoryPath'] = path.join(__dirname, '/unit-tests/test-data/trustedCaCertDirectory')
    const trustedCaCertFilePath = await getTrustedCaCertFilePath(settings)

    expect(trustedCaCertFilePath).toContain('/unit-tests/test-data/trustedCaCertDirectory/successfulCaCert.pem')
})

test('No error occurs when the trustedCaCertDirectoryPath contains NO .pem file', async() => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    try {
        const settings = {}
        settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project6')
        settings['xRunProjectDirectoryName'] = 'xrun'
        //The 'data' directory exists but does not contain any .pem files
        settings['trustedCaCertDirectoryPath'] = 'data'
        const trustedCaCertFilePath = await getTrustedCaCertFilePath(settings)

        expect(trustedCaCertFilePath).toBeNull()
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/WARNING: No '.pem' file was found within /))
    } finally {
        consoleLogSpy.mockRestore()
    }
})


test('Warns but does NOT throw when a custom trustedCaCertDirectoryPath does not exist', async() => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    try {
        const settings = {}
        settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project6')
        settings['xRunProjectDirectoryName'] = 'xrun'
        settings['trustedCaCertDirectoryPath'] = 'thisDirectoryDoesNotExist'
        const trustedCaCertFilePath = await getTrustedCaCertFilePath(settings)

        expect(trustedCaCertFilePath).toBeNull()
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/WARNING: unable to getTrustedCaCertFilePath\(\): ENOENT /))
    } finally {
        consoleLogSpy.mockRestore()
    }
})
