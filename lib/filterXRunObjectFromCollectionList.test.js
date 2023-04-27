const path = require('node:path')

const createXRunObject = require('./createXRunObject')
const filterXRunObjectFromCollectionList = require('./filterXRunObjectFromCollectionList')

test('properly filters collections', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project1')
    settings['environmentType'] = 'dev1'

    const path1 = path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory1')
    const path2 = path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory2')
    const path3 = path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory3')
    const directoryList = [
        path1,
        path2,
        path3
    ]

    const xRunObject = await createXRunObject(settings, directoryList)

    const csv1 = 'XTEST_DEMO_DATE,XTEST_DEMO_EXPECT_RESPONSE_BODY_TO_HAVE_UNORDERED_ARRAY_OF_OBJECTS_2, XTEST_DEMO_EXPECT_RESPONSE_TO_NOT_HAVE_HEADER'

    await filterXRunObjectFromCollectionList(xRunObject, csv1)

    //Validate 3 collections returned
    expect(Object.keys(xRunObject['postmanCollections'])).toHaveLength(3)
})


test('returns error when collection name not found', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project1')
    settings['environmentType'] = 'dev1'

    const path1 = path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory1')
    const path2 = path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory2')
    const path3 = path.join(__dirname, '/unit-tests/test-data/test-project1', 'directory3')
    const directoryList = [
        path1,
        path2,
        path3
    ]

    const xRunObject = await createXRunObject(settings, directoryList)

    const csv1 = 'COLLECTION_NAME_DOES_NOT_EXIST'

    await expect(filterXRunObjectFromCollectionList(xRunObject, csv1)).rejects.toThrow(/Oops, the following provided collections were not found within the provided xRunProjectPath: COLLECTION_NAME_DOES_NOT_EXIST/)
})