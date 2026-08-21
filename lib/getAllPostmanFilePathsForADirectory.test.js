const path = require('node:path')

const getAllPostmanFilePathsForADirectory = require('./getAllPostmanFilePathsForADirectory')


test('properly returns all postman file paths for a directory', async() => {
    const directoryPath = path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory3')
    const postmanFilePathList = await getAllPostmanFilePathsForADirectory(directoryPath)

    expect(postmanFilePathList).toHaveLength(7)
    expect(postmanFilePathList).toContainEqual(expect.stringMatching(/directory3\/XTEST_DEMO_XML1.postman_collection.json$/))
})


test('json files that are NOT postman files are ignored', async() => {
    const directoryPath = path.join(__dirname, '/unit-tests/test-data/test-project1', 'invalid-postman-file')
    const postmanFilePathList = await getAllPostmanFilePathsForADirectory(directoryPath)

    expect(postmanFilePathList).toHaveLength(0)
})


test('properly returns an empty list for an empty directory', async() => {
    const directoryPath = path.join(__dirname, '/unit-tests/test-data/test-project1', 'empty-directory')
    const postmanFilePathList = await getAllPostmanFilePathsForADirectory(directoryPath)

    expect(postmanFilePathList).toHaveLength(0)
})


test('returns proper error for a directory that does NOT exist', async() => {
    const directoryPath = path.join(__dirname, '/unit-tests/test-data/test-project1', 'this-directory-does-not-exist')

    await expect(getAllPostmanFilePathsForADirectory(directoryPath)).rejects.toThrow(/Oops, an error occurred trying to read directory: /)
})
