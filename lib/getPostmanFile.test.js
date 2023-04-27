const path = require('node:path')

const getPostmanFile = require('./getPostmanFile')

test('properly retrieve postmanFile for a valid filePath', async() => {
    const filePath = path.join(__dirname, 'unit-tests', 'test-data', 'test-project1', 'directory2', 'XTEST_DEMO_EXPECT_RESPONSE_BODY_TO_NOT_HAVE_RESPONSE_PROPERTY.postman_collection.json')
    const postmanFile = await getPostmanFile(filePath)

    expect(postmanFile).toHaveProperty('info.name', 'XTEST_DEMO_EXPECT_RESPONSE_BODY_TO_NOT_HAVE_RESPONSE_PROPERTY')
})


test('properly throws error for bad filePath', async() => {
    const filePath = path.join(__dirname, 'this-directory-does-not-exist', 'XTEST_DEMO_EXPECT_RESPONSE_BODY_TO_NOT_HAVE_RESPONSE_PROPERTY.postman_collection.json')

    await expect(getPostmanFile(filePath)).rejects.toThrow(/ENOENT: no such file or directory/)
})


test('properly throws error for a non json file format', async() => {
    const filePath = path.join(__dirname, 'unit-tests', 'test-data', 'test-project1', 'directory2', 'text-type-file.txt')

    await expect(getPostmanFile(filePath)).rejects.toThrow(/Unexpected end of JSON input/)
})