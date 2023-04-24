const path = require('node:path')

const getAllPostmanFiles = require('./getAllPostmanFiles')


test('properly returns postmanFiles', async() => {
    const path1 = path.join(__dirname, '/unit-tests/test-data/test-suites-project1', 'directory1')
    const path2 = path.join(__dirname, '/unit-tests/test-data/test-suites-project1', 'directory2')
    const path3 = path.join(__dirname, '/unit-tests/test-data/test-suites-project1', 'directory3')
    const directoryList = [
        path1,
        path2,
        path3
    ]
    const postmanFilesObject = await getAllPostmanFiles(directoryList)

    //Validate top level contains 3 keys
    expect(Object.keys(postmanFilesObject)).toHaveLength(3)

    //Validate path1 contains 12 keys
    expect(Object.keys(postmanFilesObject[path1])).toHaveLength(12)

    //Validate path2 contains 9 keys
    expect(Object.keys(postmanFilesObject[path2])).toHaveLength(9)

    //Validate path3 contains 7 keys
    expect(Object.keys(postmanFilesObject[path3])).toHaveLength(7)
})


test('returns proper error for invalid directoryPath', async() => {
    const invalidPath = path.join(__dirname, '/unit-tests/test-data/test-suites-project1', 'does-not-exist')
    const directoryList = [
        invalidPath
    ]

    await expect(getAllPostmanFiles(directoryList)).rejects.toThrow(/ENOENT: no such file or directory/)
})


test('returns proper error for directoryPath with no postman tests', async() => {
    const invalidPath = path.join(__dirname, '/unit-tests/test-data/test-suites-project1', 'xrun')
    const directoryList = [
        invalidPath
    ]

    await expect(getAllPostmanFiles(directoryList)).rejects.toThrow(/Oops, at least one 'postman_collection' file is required per directory. Did not find any within: /)
})