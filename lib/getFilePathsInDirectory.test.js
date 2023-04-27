const path = require('node:path')

const getFilePathsInDirectory = require('./getFilePathsInDirectory')


test('proper set of filepaths returned for valid directoryPath and fileExtensionFilter = .json', async() => {
    const directoryPath = path.join(__dirname, 'unit-tests', 'test-data', 'test-project1', 'directory2')
    const fileExtensionFilter = '.json'
    const filePathArray = await getFilePathsInDirectory(directoryPath, fileExtensionFilter)

    //Contains 9 filePaths
    expect(filePathArray).toHaveLength(9)

    //Validate fileNames
    expect(filePathArray).toContainEqual(expect.stringMatching(/XTEST_DEMO_EXPECT_RESPONSE_BODY_TO_NOT_HAVE_RESPONSE_PROPERTY.postman_collection/))
})


test('proper set of filepaths returned for valid directoryPath and fileExtensionFilter = .txt', async() => {
    const directoryPath = path.join(__dirname, 'unit-tests', 'test-data', 'test-project1', 'directory2')
    const fileExtensionFilter = '.txt'
    const filePathArray = await getFilePathsInDirectory(directoryPath, fileExtensionFilter)

    //Contains 1 filePaths
    expect(filePathArray).toHaveLength(1)

    //Validate fileNames
    expect(filePathArray).toContainEqual(expect.stringMatching(/text-type-file/))
})


test('proper set of filepaths returned for valid directoryPath and fileExtensionFilter = .invalid', async() => {
    const directoryPath = path.join(__dirname, 'unit-tests', 'test-data', 'test-project1', 'directory2')
    const fileExtensionFilter = '.invalid'
    const filePathArray = await getFilePathsInDirectory(directoryPath, fileExtensionFilter)

    //Contains 0 filePaths
    expect(filePathArray).toHaveLength(0)
})


test('returns proper error when xRunProjectPath is invalid', async() => {
    const directoryPath = path.join(__dirname, 'does-not-exist')
    const fileExtensionFilter = '.txt'

    await expect(getFilePathsInDirectory(directoryPath, fileExtensionFilter)).rejects.toThrow(/ENOENT: no such file or directory/)
})