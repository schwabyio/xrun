const path = require('path')

const getFile = require('./getFile')


test('properly returns dev1.bulk file', async() => {
    const filePath = path.join(__dirname, 'unit-tests', 'test-data', 'test-suites-project1', 'xrun', 'dev1.bulk')
    const data = await getFile(filePath)

    expect(data).toMatch('var1:dev1-var1')
    expect(data).toMatch('var2:dev1-var2')
})

test('properly throws error for bad filePath', async() => {
    const badFilePath = path.join(__dirname, 'this-file-does-not-exist.txt')

    await expect(getFile(badFilePath)).rejects.toThrow(/ENOENT: no such file or directory/)
})