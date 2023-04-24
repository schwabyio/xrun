const path = require('node:path')

const getXRunDirectoryList = require('./getXRunDirectoryList')



test('properly returns directoryList', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project1')
    settings['suiteId'] = 'regression'
    const directoryList = await getXRunDirectoryList(settings)

    //Contains 3 directories
    expect(directoryList).toHaveLength(3)

    //Check names of directories
    expect(directoryList).toContainEqual(expect.stringMatching(/directory1/))
    expect(directoryList).toContainEqual(expect.stringMatching(/directory2/))
    expect(directoryList).toContainEqual(expect.stringMatching(/directory3/))
})


test('properly returns directoryList even when suiteId contains an invalid directory', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project1')
    settings['suiteId'] = 'invalid-directory'
    const directoryList = await getXRunDirectoryList(settings)

    //Contains 1 directories
    expect(directoryList).toHaveLength(1)

    //Check names of directories
    expect(directoryList).toContainEqual(expect.stringMatching(/does-not-exist/))
})


test('returns proper error when xRunProjectPath is invalid', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/does-not-exist')
    settings['suiteId'] = 'regression'

    await expect(getXRunDirectoryList(settings)).rejects.toThrow(/ENOENT: no such file or directory/)
})


test('returns proper error when directory xRunProjectPath does not contain "xrun" directory', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project1/directory1')
    settings['suiteId'] = 'regression'

    await expect(getXRunDirectoryList(settings)).rejects.toThrow(/Oops, there must be a directory named 'xrun' within/)
})


test('returns proper error for valid suiteId with no directories', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project1')
    settings['suiteId'] = 'empty'

    await expect(getXRunDirectoryList(settings)).rejects.toThrow(/does not contain any directories./)
})


test('returns proper error for invalid suiteId', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project1')
    settings['suiteId'] = 'does-not-exist'

    await expect(getXRunDirectoryList(settings)).rejects.toThrow(/Oops, error converting suites file /)
})