const path = require('node:path')

//Mock runTests so runAllPostmanTests()/runCSVPostmanTests() do not actually run any postman tests
jest.mock('./runTests', () => {
    return jest.fn().mockImplementation(() => {
        return {
            run: jest.fn().mockResolvedValue('PASSED')
        }
    })
})

const xRunLib = require('./xrun-lib')
const xRun = new xRunLib()

const testProject8Path = path.join(__dirname, '/unit-tests/test-data/test-project8')

test('getUsage(): properly returns usage', async() => {
    const usage = await xRun.getUsage()

    expect(usage).toMatch(/USAGE/)
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


test('getPostmanTests(): returns proper error for a project that does NOT exist', async() => {
    const settings = {}
    settings['xRunProjectPath'] = path.join(__dirname, '/unit-tests/test-data/this-project-does-not-exist')
    settings['xRunProjectDirectoryName'] = 'xrun'

    await expect(xRun.getPostmanTests(settings)).rejects.toThrow(/Oops, unable to access xRunProjectPath /)
})


test('getProcessCwdPath(): properly returns the current working directory', async() => {
    const processCwdPath = await xRun.getProcessCwdPath()

    expect(processCwdPath).toBe(process.cwd())
})


test('getXrunDirectoryPath(): properly returns the xrun directory path', async() => {
    const processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(testProject8Path)

    try {
        const xrunDirectoryPath = await xRun.getXrunDirectoryPath()

        expect(xrunDirectoryPath).toBe(path.join(testProject8Path, 'xrun'))
    } finally {
        processCwdSpy.mockRestore()
    }
})


test('getSettingsPath(): properly returns the settings.json path', async() => {
    const processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(testProject8Path)

    try {
        const settingsPath = await xRun.getSettingsPath()

        expect(settingsPath).toBe(path.join(testProject8Path, 'xrun', 'settings.json'))
    } finally {
        processCwdSpy.mockRestore()
    }
})


test('getDefaultTestResultsBasePath(): properly returns the default test results path', async() => {
    const processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(testProject8Path)

    try {
        const defaultTestResultsBasePath = await xRun.getDefaultTestResultsBasePath()

        expect(defaultTestResultsBasePath).toBe(path.join(testProject8Path, 'xrun', 'test-results'))
    } finally {
        processCwdSpy.mockRestore()
    }
})


test('getSettings(): properly returns settings from a settings.json', async() => {
    const settingsPath = path.join(testProject8Path, 'xrun', 'settings.json')
    const settings = await xRun.getSettings(settingsPath)

    expect(settings).toHaveProperty('projectName', 'test-project8')
    expect(settings).toHaveProperty('environmentType', 'dev1')
    expect(settings).toHaveProperty('limitConcurrency', 2)

    //xRunProjectPath is always injected from the current working directory
    expect(settings).toHaveProperty('xRunProjectPath', process.cwd())
})


test('getSettings(): returns proper error for a settings.json that does NOT exist', async() => {
    const settingsPath = path.join(testProject8Path, 'xrun', 'settings-does-not-exist.json')

    await expect(xRun.getSettings(settingsPath)).rejects.toThrow(/Oops, unable to load settings file /)
})


test('initializeSettingsPath(): properly returns the settingsPath for a valid xrun project', async() => {
    const processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(testProject8Path)

    try {
        const settingsPath = await xRun.initializeSettingsPath()

        expect(settingsPath).toBe(path.join(testProject8Path, 'xrun', 'settings.json'))
    } finally {
        processCwdSpy.mockRestore()
    }
})


test('initializeSettingsPath(): returns proper error when there is NO xrun directory', async() => {
    const processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, '/unit-tests/test-data/test-project2'))

    try {
        await expect(xRun.initializeSettingsPath()).rejects.toThrow(/Oops, xrun must be run from the tests case project root directory which includes an 'xrun' folder./)
    } finally {
        processCwdSpy.mockRestore()
    }
})


test('initializeSettingsPath(): returns proper error when the xrun directory has NO settings.json', async() => {
    const processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, '/unit-tests/test-data/test-project4'))

    try {
        await expect(xRun.initializeSettingsPath()).rejects.toThrow(/Oops, the test case project 'xrun' folder is missing the required 'settings.json' configuration./)
    } finally {
        processCwdSpy.mockRestore()
    }
})


test('runAllPostmanTests(): properly returns the final test result', async() => {
    const settings = {}
    settings['xRunProjectPath'] = testProject8Path
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['environmentType'] = 'dev1'

    const testFinalResult = await xRun.runAllPostmanTests(settings)

    expect(testFinalResult).toBe('PASSED')
})


test('runCSVPostmanTests(): properly returns the final test result', async() => {
    const settings = {}
    settings['xRunProjectPath'] = testProject8Path
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['environmentType'] = 'dev1'

    const testFinalResult = await xRun.runCSVPostmanTests(settings, 'XTEST_DEMO_DATE')

    expect(testFinalResult).toBe('PASSED')
})


test('runCSVPostmanTests(): returns proper error for a COLLECTION NAME that does NOT exist', async() => {
    const settings = {}
    settings['xRunProjectPath'] = testProject8Path
    settings['xRunProjectDirectoryName'] = 'xrun'
    settings['environmentType'] = 'dev1'

    await expect(xRun.runCSVPostmanTests(settings, 'THIS_COLLECTION_DOES_NOT_EXIST')).rejects.toThrow(/Oops, unable to locate provided collectionName: /)
})
