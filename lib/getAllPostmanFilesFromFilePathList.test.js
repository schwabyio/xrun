const path = require('node:path')

const getAllPostmanFilesFromFilePathList = require('./getAllPostmanFilesFromFilePathList')


test('properly returns a postmanFilesObject keyed by postman file path', async() => {
    const postmanFilePath = path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory1', 'XTEST_DEMO_DATE.postman_collection.json')
    const postmanFilesObject = await getAllPostmanFilesFromFilePathList([postmanFilePath])

    expect(Object.keys(postmanFilesObject)).toHaveLength(1)
    expect(postmanFilesObject[postmanFilePath]['postmanFile']['info']).toHaveProperty('name', 'XTEST_DEMO_DATE')
})


test('properly returns an empty postmanFilesObject for an empty list', async() => {
    const postmanFilesObject = await getAllPostmanFilesFromFilePathList([])

    expect(postmanFilesObject).toEqual({})
})


test('returns proper error for a postman file path that does NOT exist', async() => {
    const postmanFilePath = path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory1', 'THIS_DOES_NOT_EXIST.postman_collection.json')

    await expect(getAllPostmanFilesFromFilePathList([postmanFilePath])).rejects.toThrow(/Oops, got the following error retrieving the Postman file/)
})
