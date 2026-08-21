const path = require('node:path')

const getXRunDirectoryPathList = require('./getXRunDirectoryPathList')


test('properly returns all directoryPaths when NOT using the exclude-list', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project3')
    settings['xRunProjectDirectoryName'] = 'xrun'
    const directoryPathList = await getXRunDirectoryPathList(settings, false)

    //The xRunProjectDirectoryName ('xrun') is always excluded
    expect(directoryPathList).toHaveLength(4)
    expect(directoryPathList).toContainEqual(expect.stringMatching(/test-project3\/directory1$/))
    expect(directoryPathList).toContainEqual(expect.stringMatching(/test-project3\/directory2$/))
    expect(directoryPathList).toContainEqual(expect.stringMatching(/test-project3\/directory3$/))
    expect(directoryPathList).toContainEqual(expect.stringMatching(/test-project3\/invalid-postman-file$/))
    expect(directoryPathList).not.toContainEqual(expect.stringMatching(/test-project3\/xrun$/))
})


test('properly excludes directories from the exclude-list when using the exclude-list', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project3')
    settings['xRunProjectDirectoryName'] = 'xrun'
    const directoryPathList = await getXRunDirectoryPathList(settings, true)

    //test-project3 excludes 'directory2', 'empty-directory' and 'invalid-postman-file'
    expect(directoryPathList).toHaveLength(2)
    expect(directoryPathList).toContainEqual(expect.stringMatching(/test-project3\/directory1$/))
    expect(directoryPathList).toContainEqual(expect.stringMatching(/test-project3\/directory3$/))
    expect(directoryPathList).not.toContainEqual(expect.stringMatching(/test-project3\/directory2$/))
})


test('properly returns all directoryPaths when the project has NO exclude-list', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project2')
    settings['xRunProjectDirectoryName'] = 'xrun'
    const directoryPathList = await getXRunDirectoryPathList(settings, true)

    expect(directoryPathList).toHaveLength(2)
    expect(directoryPathList).toContainEqual(expect.stringMatching(/test-project2\/directory1$/))
})


test('returns proper error when xRunProjectPath can NOT be accessed', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/this-project-does-not-exist')
    settings['xRunProjectDirectoryName'] = 'xrun'

    await expect(getXRunDirectoryPathList(settings, true)).rejects.toThrow(/Oops, unable to access xRunProjectPath /)
})


test('returns proper error when the project does NOT contain any directories', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project5')
    settings['xRunProjectDirectoryName'] = 'xrun'

    await expect(getXRunDirectoryPathList(settings, true)).rejects.toThrow(/Must contain at least one directory/)
})
