const path = require('node:path')

const xRunPostmanVariables = require('./xRunPostmanVariables')
const xRunVariables = new xRunPostmanVariables()
const globalVariablesPath = xRunVariables.getGlobalVariablesPath()
const postmanGlobalVariableObject = xRunVariables.initializePostmanVariableObject('globals')
const postmanEnvironmentVariableObject = xRunVariables.initializePostmanVariableObject('environment')
const xRunProjectPath = path.join(__dirname, '/unit-tests/test-data/test-suites-project1')
const environmentType = 'dev1'


test('populateAllVariables(): properly populates postmanGlobalVariableObject and postmanEnvironmentVariableObject', async() => {

    await xRunVariables.populateAllVariables(globalVariablesPath, postmanGlobalVariableObject, postmanEnvironmentVariableObject, xRunProjectPath, environmentType)

    //Validate postmanGlobalVariableObject
    //Top level has 7 keys
    expect(Object.keys(postmanGlobalVariableObject)).toHaveLength(7)

    //Values has 2 keys
    expect(Object.keys(postmanGlobalVariableObject['values'])).toHaveLength(2)


    //Validate postmanEnvironmentVariableObject
    //Top level has 7 keys
    expect(Object.keys(postmanEnvironmentVariableObject)).toHaveLength(7)

    //Values has 3 keys
    expect(Object.keys(postmanEnvironmentVariableObject['values'])).toHaveLength(3)

    //Validate values contains var1 and var2
    //https://codewithhugo.com/jest-array-object-match-contain/
    expect(postmanEnvironmentVariableObject['values']).toEqual(
        expect.arrayContaining([
            expect.objectContaining({"key": "var1", "value": "dev1-var1"}),
            expect.objectContaining({"key": "var2", "value": "dev1-var2"}),
        ])
    )
})


test('populateAllVariables(): returns proper error when globalVariablesPath is invalid', async() => {
    const globalVariablesPath = path.join(__dirname, '/unit-tests/test-data/does-not-exist')

    await expect(xRunVariables.populateAllVariables(globalVariablesPath, postmanGlobalVariableObject, postmanEnvironmentVariableObject, xRunProjectPath, environmentType)).rejects.toThrow(/ENOENT: no such file or directory/)
})