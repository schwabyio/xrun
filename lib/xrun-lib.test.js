const path = require('path')

const xRunLib = require('./xrun-lib')
const xRun = new xRunLib()

test('getUsage(): properly returns usage', () => {
    expect(xRun.getUsage()).toMatch(/xRun Ver./)
})


test('getDirectoryListAsync(): properly returns directoryList', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project')
    settings['suiteId'] = 'regression'
    const directoryList = await xRun.getDirectoryListAsync(settings)

    //Contains 3 directories
    expect(directoryList).toHaveLength(3)

    //Check names of directories
    expect(directoryList).toContainEqual(expect.stringMatching(/directory1/))
    expect(directoryList).toContainEqual(expect.stringMatching(/directory2/))
    expect(directoryList).toContainEqual(expect.stringMatching(/directory3/))
})


test('getDirectoryListAsync(): properly returns directoryList even when suiteId contains an invalid directory', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project')
    settings['suiteId'] = 'invalid-directory'
    const directoryList = await xRun.getDirectoryListAsync(settings)

    //Contains 1 directories
    expect(directoryList).toHaveLength(1)

    //Check names of directories
    expect(directoryList).toContainEqual(expect.stringMatching(/does-not-exist/))
})


test('getDirectoryListAsync(): returns proper error xRunProjectPath is invalid', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/does-not-exist')
    settings['suiteId'] = 'regression'

    await expect(xRun.getDirectoryListAsync(settings)).rejects.toThrow(/ENOENT: no such file or directory/)
})


test('getDirectoryListAsync(): returns proper error when directory xRunProjectPath does not contain "xrun" directory', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project/directory1')
    settings['suiteId'] = 'regression'

    await expect(xRun.getDirectoryListAsync(settings)).rejects.toThrow(/Oops, there must be a directory named 'xrun' within/)
})


test('getDirectoryListAsync(): returns proper error for valid suiteId with no directories', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project')
    settings['suiteId'] = 'empty'

    await expect(xRun.getDirectoryListAsync(settings)).rejects.toThrow(/does not contain any directories./)
})


test('getDirectoryListAsync(): returns proper error for invalid suiteId', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project')
    settings['suiteId'] = 'does-not-exist'

    await expect(xRun.getDirectoryListAsync(settings)).rejects.toThrow(/Oops, error converting suites file /)
})