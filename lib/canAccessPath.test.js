const path = require('path')

const canAccessPath = require('./canAccessPath')


test('no error is thrown for valid filePath', async() => {
    const filePath = path.join(__dirname, './canAccessPath.js')
    const response = await canAccessPath(filePath)

    expect(response).toEqual(true)
})

test('no error is thrown for valid directoryPath', async() => {
    const directoryPath = path.join(__dirname)
    const response = await canAccessPath(directoryPath)

    expect(response).toEqual(true)
})

test('properly throws error for bad path', async() => {
    const badFilePath = path.join(__dirname, 'this-file-does-not-exist.bulk')

    await expect(canAccessPath(badFilePath)).rejects.toThrow(/ENOENT: no such file or directory/)
})