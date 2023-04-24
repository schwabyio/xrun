const path = require('node:path')

const createXRunObject = require('./createXRunObject')


test('properly returns postmanFiles', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project1')
    settings['environmentType'] = 'dev1'

    const path1 = path.join(__dirname, '/unit-tests/test-data/test-suites-project1', 'directory1')
    const path2 = path.join(__dirname, '/unit-tests/test-data/test-suites-project1', 'directory2')
    const path3 = path.join(__dirname, '/unit-tests/test-data/test-suites-project1', 'directory3')
    const directoryList = [
        path1,
        path2,
        path3
    ]

    const xRunObject = await createXRunObject(settings, directoryList)

    //Validate top level
    expect(Object.keys(xRunObject)).toHaveLength(1)
})


test('returns proper error when directoryList does not contain any valid postman collections', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-suites-project1')
    settings['environmentType'] = 'dev1'

    const path1 = path.join(__dirname, '/unit-tests/test-data/test-suites-project1', 'empty-directory')
    const path2 = path.join(__dirname, '/unit-tests/test-data/test-suites-project1', 'invalid-postman-file')
    const directoryList = [path1, path2]

    await expect(createXRunObject(settings, directoryList)).rejects.toThrow(/Oops, at least one 'postman_collection' file is required per directory. Did not find any within: /)
})