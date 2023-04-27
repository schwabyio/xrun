const path = require('node:path')

const xRunLib = require('./xrun-lib')
const xRun = new xRunLib()

test('getUsage(): properly returns usage', () => {
    expect(xRun.getUsage()).toMatch(/USAGE/)
})


test('getPostmanTests(): properly returns get postman tests response', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/test-project1')
    settings['xRunProjectDirectoryName'] = 'xrun'
    const postmanTestsResponse = await xRun.getPostmanTests(settings)

    expect(postmanTestsResponse).toMatch(/1 XTEST_DEMO_DATE                                                                             5 directory1/)
    expect(postmanTestsResponse).toMatch(/17 XTEST_DEMO_EXPECT_RESPONSE_STATUS_CODE_TO_NOT_BE_THIS_REGEXP                                5 directory2/)
    expect(postmanTestsResponse).toMatch(/28 XTEST_DEMO_XML2                                                                             1 directory3/)
})