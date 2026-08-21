const path = require('node:path')

const getAllPostmanFilePathList = require('./getAllPostmanFilePathList')


test('properly returns all postman file paths for a list of absolute directory paths', async() => {
    const directoryPathList = [
        path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory2'),
        path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory3')
    ]
    const postmanFilePathList = await getAllPostmanFilePathList(directoryPathList, true)

    //directory2 has 9 postman files and directory3 has 7 postman files
    expect(postmanFilePathList).toHaveLength(16)
})


test('properly resolves a relative directory path from the current working directory', async() => {
    const processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, '/unit-tests/test-data/test-project1'))

    try {
        const postmanFilePathList = await getAllPostmanFilePathList(['directory3'], true)

        expect(postmanFilePathList).toHaveLength(7)
        expect(postmanFilePathList).toContainEqual(expect.stringMatching(/test-project1\/directory3\/XTEST_DEMO_XML1.postman_collection.json$/))
    } finally {
        processCwdSpy.mockRestore()
    }
})


test('returns proper error when a directory has NO postman files and throwErrorOnEmptyDirectory is true', async() => {
    const directoryPathList = [
        path.join(__dirname, '/unit-tests/test-data/test-project1', 'invalid-postman-file')
    ]

    await expect(getAllPostmanFilePathList(directoryPathList, true)).rejects.toThrow(/No Postman type files were found in the provided directoryPath /)
})


test('does NOT throw an error when a directory has NO postman files and throwErrorOnEmptyDirectory is false', async() => {
    const directoryPathList = [
        path.join(__dirname, '/unit-tests/test-data/test-project1', 'invalid-postman-file'),
        path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory3')
    ]
    const postmanFilePathList = await getAllPostmanFilePathList(directoryPathList, false)

    expect(postmanFilePathList).toHaveLength(7)
})
