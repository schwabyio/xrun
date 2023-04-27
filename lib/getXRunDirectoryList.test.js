const path = require('node:path')

const getXRunDirectoryList = require('./getXRunDirectoryList')



test('properly returns directoryList for test-project1', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project1')
    settings['xRunProjectDirectoryName'] = 'xrun'
    const directoryList = await getXRunDirectoryList(settings)

    //Confirm number of directories
    expect(directoryList).toHaveLength(3)

    //Check names of directories
    expect(directoryList).toContainEqual(expect.stringMatching(/directory1/))
    expect(directoryList).toContainEqual(expect.stringMatching(/directory2/))
    expect(directoryList).toContainEqual(expect.stringMatching(/directory3/))
})


test('properly returns directoryList for test-project2 (no xrun directory)', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project2')
    settings['xRunProjectDirectoryName'] = 'xrun'
    const directoryList = await getXRunDirectoryList(settings)

    expect(directoryList).toHaveLength(2)

    //Confirm number of directories
    expect(directoryList).toContainEqual(expect.stringMatching(/directory1/))
    expect(directoryList).toContainEqual(expect.stringMatching(/throwaway/))
})


test('properly returns directoryList for test-project3', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project3')
    settings['xRunProjectDirectoryName'] = 'xrun'
    const directoryList = await getXRunDirectoryList(settings)

    //Contains 3 directories
    expect(directoryList).toHaveLength(2)

    //Check names of directories
    expect(directoryList).toContainEqual(expect.stringMatching(/directory1/))
    expect(directoryList).toContainEqual(expect.stringMatching(/directory3/))
})


test('returns proper error when xRunProjectPath is invalid', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/does-not-exist')
    settings['xRunProjectDirectoryName'] = 'xrun'

    await expect(getXRunDirectoryList(settings)).rejects.toThrow(/ENOENT: no such file or directory/)
})


test('returns proper error when exclude-list.json is invalid', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project4')
    settings['xRunProjectDirectoryName'] = 'xrun'

    await expect(getXRunDirectoryList(settings)).rejects.toThrow(/Oops, unable to read /)
})


test('returns proper error when xRunProjectPath contains no directories', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project5')
    settings['xRunProjectDirectoryName'] = 'xrun'

    await expect(getXRunDirectoryList(settings)).rejects.toThrow(/Error: Must contain at least one directory./)
})