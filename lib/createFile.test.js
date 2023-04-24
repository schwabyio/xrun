const path = require('path')

const createFile = require('./createFile')


test('properly writes a file', async() => {
    const filePath = path.join(__dirname, 'unit-tests', 'test-data', 'test-suites-project2', 'throwaway', 'test-file.txt')
    const data = 'Creating this test file.'

    await expect(createFile(filePath, data)).resolves.not.toThrow()
})

test('properly throws error for bad filePath', async() => {
    const badFilePath = path.join(__dirname, 'unit-tests', 'test-data', 'test-suites-project1', 'this-directory-does-not-exist', 'file-should-not-be-created.txt')
    const data = 'Creating this test file.'

    await expect(createFile(badFilePath, data)).rejects.toThrow(/ENOENT: no such file or directory/)
})