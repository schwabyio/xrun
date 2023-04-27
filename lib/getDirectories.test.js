const path = require('path')

const getDirectories = require('./getDirectories')


test('properly returns directoryList', async() => {
    const directoryPath = path.join(__dirname, '/unit-tests/test-data/test-project1')
    const directoryList = await getDirectories(directoryPath)

    expect(directoryList).toHaveLength(6)

    //Confirm directory names within  directoryList
    expect(directoryList).toContainEqual("directory1")
    expect(directoryList).toContainEqual("directory2")
    expect(directoryList).toContainEqual("directory3")
    expect(directoryList).toContainEqual("empty-directory")
    expect(directoryList).toContainEqual("invalid-postman-file")
    expect(directoryList).toContainEqual("xrun")
})

test('properly returns empty directoryList', async() => {
    const directoryPath = path.join(__dirname, '/unit-tests/test-data/test-project1/directory1')
    const directoryList = await getDirectories(directoryPath)

    expect(directoryList).toHaveLength(0)

})


test('properly throws error for bad directoryPath', async() => {
    const badDirectoryPath = path.join(__dirname, '/unit-tests/test-data/this-directory-does-not-exist')

    await expect(getDirectories(badDirectoryPath)).rejects.toThrow(/ENOENT: no such file or directory/)
})