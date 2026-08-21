const path = require('node:path')

const createXRunObjectFromCsvList = require('./createXRunObjectFromCsvList')

const testProject3Path = path.join(__dirname, '/unit-tests/test-data/test-project3')

const getSettings = function getSettings() {
    const settings = {}
    settings['xRunProjectPath'] = testProject3Path
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['environmentType'] = 'dev1'

    return settings
}


test('properly returns an xRunObject for a single COLLECTION NAME', async() => {
    const xRunObject = await createXRunObjectFromCsvList(getSettings(), 'XTEST_DEMO_DATE')

    expect(xRunObject['postmanCollections']).toHaveLength(1)
    expect(xRunObject['postmanCollections'][0]['collection']['info']).toHaveProperty('name', 'XTEST_DEMO_DATE')
    expect(xRunObject['postmanCollections'][0]).toHaveProperty('directoryName', 'directory1')
    expect(xRunObject).toHaveProperty('xtestVersion')
})


test('properly returns an xRunObject for a csv list of COLLECTION NAMEs', async() => {
    const xRunObject = await createXRunObjectFromCsvList(getSettings(), 'XTEST_DEMO_DATE,XTEST_DEMO_XML1')

    expect(xRunObject['postmanCollections']).toHaveLength(2)
})


test('properly ignores whitespace within the csv list', async() => {
    const xRunObject = await createXRunObjectFromCsvList(getSettings(), ' XTEST_DEMO_DATE , XTEST_DEMO_XML1 ')

    expect(xRunObject['postmanCollections']).toHaveLength(2)
})


test('COLLECTION NAMEs from the exclude-list ARE included', async() => {
    //test-project3 excludes 'directory2' using xrun/exclude-list.json
    const xRunObject = await createXRunObjectFromCsvList(getSettings(), 'XTEST_DEMO_EXPECT_RESPONSE_STATUS_CODE_TO_BE_NUMBER')

    expect(xRunObject['postmanCollections']).toHaveLength(1)
    expect(xRunObject['postmanCollections'][0]).toHaveProperty('directoryName', 'directory2')
})


test('properly returns an xRunObject for a DIRECTORY NAME', async() => {
    const processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(testProject3Path)

    try {
        const xRunObject = await createXRunObjectFromCsvList(getSettings(), 'directory3')

        //directory3 has 7 postman files
        expect(xRunObject['postmanCollections']).toHaveLength(7)
    } finally {
        processCwdSpy.mockRestore()
    }
})


test('properly returns an xRunObject for a csv list of a DIRECTORY NAME and a COLLECTION NAME', async() => {
    const processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(testProject3Path)

    try {
        const xRunObject = await createXRunObjectFromCsvList(getSettings(), 'directory3,XTEST_DEMO_DATE')

        //7 postman files from directory3 plus the XTEST_DEMO_DATE collection
        expect(xRunObject['postmanCollections']).toHaveLength(8)
    } finally {
        processCwdSpy.mockRestore()
    }
})


test('returns proper error for a COLLECTION NAME that does NOT exist', async() => {
    await expect(createXRunObjectFromCsvList(getSettings(), 'THIS_COLLECTION_DOES_NOT_EXIST')).rejects.toThrow(/Oops, unable to locate provided collectionName: THIS_COLLECTION_DOES_NOT_EXIST/)
})


test('returns proper error for a DIRECTORY NAME that does NOT contain any postman files', async() => {
    const processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(testProject3Path)

    try {
        await expect(createXRunObjectFromCsvList(getSettings(), 'invalid-postman-file')).rejects.toThrow(/No Postman type files were found in the provided directoryPath /)
    } finally {
        processCwdSpy.mockRestore()
    }
})
