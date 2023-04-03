const path = require('path')

const xRunLib = require('./xrun-lib')
const xRun = new xRunLib()
const getFile = require('./getFile')


test('properly returns globalVariables file', async() => {
    const data = await getFile(xRun.globalVariablesPath)

    expect(data).toMatch('useStrictValidation:')
    expect(data).toMatch('xtest:')
})

test('properly throws error for bad filePath', async() => {
    const badFilePath = path.join(__dirname, 'this-file-does-not-exist.txt')

    await expect(getFile(badFilePath)).rejects.toThrow(/ENOENT: no such file or directory/)
})