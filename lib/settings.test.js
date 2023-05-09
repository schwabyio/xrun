const path = require('node:path')

const Settings = require('./settings')

const setting = new Settings()

test('init(): properly returns settings', async() => {
    const settingsPath = path.join(__dirname, 'unit-tests/test-data/test-settings/test-settings1.json')
    const settings = await setting.init(settingsPath)

    expect(settings).toHaveProperty("projectName", "test-project1")
    expect(settings).toHaveProperty("sendSummaryResultsToSlack", true)
})


test('init(): properly returns error for invalid property: nat-not-zero', async() => {
    const settingsPath = path.join(__dirname, 'unit-tests/test-data/test-settings/test-settings-invalid-nat-not-zero.json')

    await expect(setting.init(settingsPath)).rejects.toThrow(/validation error: timeoutCollection: value must be a positive integer and also not zero: /)
})


test('init(): properly returns error for invalid property: boolean', async() => {
    const settingsPath = path.join(__dirname, 'unit-tests/test-data/test-settings/test-settings-invalid-boolean.json')

    await expect(setting.init(settingsPath)).rejects.toThrow(/validation error: autoOpenTestResultHtml: value is not a Boolean type/)
})


test('init(): properly returns error for invalid property: string', async() => {
    const settingsPath = path.join(__dirname, 'unit-tests/test-data/test-settings/test-settings-invalid-string.json')

    await expect(setting.init(settingsPath)).rejects.toThrow(/validation error: slackChannel: value is not a String type/)
})


test('init(): properly returns error for invalid property: non-empty-string', async() => {
    const settingsPath = path.join(__dirname, 'unit-tests/test-data/test-settings/test-settings-invalid-non-empty-string.json')

    await expect(setting.init(settingsPath)).rejects.toThrow(/validation error: xRunProjectPath: value must be a non-empty string: /)
})


test('init(): properly returns error for invalid property: non-empty-no-spaces-string', async() => {
    const settingsPath = path.join(__dirname, 'unit-tests/test-data/test-settings/test-settings-invalid-non-empty-no-spaces-string.json')

    await expect(setting.init(settingsPath)).rejects.toThrow(/validation error: projectName: value must not contain any whitespace characters:/)
})


test('init(): properly returns error for invalid settingsPath', async() => {
    const settingsPath = path.join(__dirname, 'unit-tests/test-data/test-settings/does-not-exist.json')

    await expect(setting.init(settingsPath)).rejects.toThrow(/Oops, unable to load settings file /)
})


test('init(): properly returns error for invalid json', async() => {
    const settingsPath = path.join(__dirname, 'unit-tests/test-data/test-settings/invalid-json.json')

    await expect(setting.init(settingsPath)).rejects.toThrow(/Oops, unable to load settings file /)
})