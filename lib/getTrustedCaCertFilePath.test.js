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