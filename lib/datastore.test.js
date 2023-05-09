const path = require('node:path')
const { unlink } = require('node:fs/promises')

const datastore = require('./datastore')


test('exists(): properly returns true', async() => {
    const datastorePath = path.join(__dirname, 'unit-tests/test-data/test-directory/test-datastore.json')
    const ds = new datastore(datastorePath)
    const result = await ds.exists()

    expect(result).toBe(true)
})


test('exists(): properly returns false', async() => {
    const datastorePath = path.join(__dirname, 'unit-tests/test-data/test-directory/datastore-does-not-exist.json')
    const ds = new datastore(datastorePath)
    const result = await ds.exists()

    expect(result).toBe(false)
})


test('getValue(): properly returns value', async() => {
    const datastorePath = path.join(__dirname, 'unit-tests/test-data/test-directory/test-datastore.json')
    const ds = new datastore(datastorePath)
    const result = await ds.getValue("test-property1")

    expect(result).toBe("test-value1")
})


test('getValue(): properly returns error when datastorePath is invalid', async() => {
    const datastorePath = path.join(__dirname, 'unit-tests/test-data/test-directory/datastore-does-not-exist.json')
    const ds = new datastore(datastorePath)

    await expect(ds.getValue('x')).rejects.toThrow(/Error: Unable to read data store path /)
})

test('getValue(): properly returns error when datastore is invalid', async() => {
    const datastorePath = path.join(__dirname, 'unit-tests/test-data/test-directory/invalid-datastore.json')
    const ds = new datastore(datastorePath)

    await expect(ds.getValue('x')).rejects.toThrow(/Error: Unable to parse data store object /)
})


test('getValue(): properly returns error when propertyName is invalid', async() => {
    const datastorePath = path.join(__dirname, 'unit-tests/test-data/test-directory/test-datastore.json')
    const ds = new datastore(datastorePath)

    await expect(ds.getValue('invalid')).rejects.toThrow(/Oops, unable to locate 'invalid' in dataObject./)
})


test('setValue(): properly sets value for already existing datastorePath', async() => {
    const datastorePath = path.join(__dirname, 'unit-tests/test-data/test-directory/test-datastore.json')
    const ds = new datastore(datastorePath)
    const result = await ds.setValue("test-property2", "test-value2")

    expect(result).toBe("update-ok")
})


test('setValue(): properly returns error when already existing datastore is invalid', async() => {
    const datastorePath = path.join(__dirname, 'unit-tests/test-data/test-directory/invalid-datastore.json')
    const ds = new datastore(datastorePath)

    await expect(ds.setValue('x', 'y')).rejects.toThrow(/Error: Unable to parse data store object /)
})


test('setValue(): properly sets value for a new datastorePath', async() => {
    const datastorePath = path.join(__dirname, 'unit-tests/test-data/test-directory/new-test-datastore.json')
    const ds = new datastore(datastorePath)

    //Remove datastorePath if it already exists
    try {
        await unlink(datastorePath)
    } catch (error) {
        //IGNORE
    }

    const result = await ds.setValue("test-property-new", "test-value-new")
    
    expect(result).toBe("create-ok")

})