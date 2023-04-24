const stringCompare = require('./stringCompare')
const strComp = new stringCompare()

test('insensitive(): properly returns comparison 0 (equal)', () => {
    const upper1 = "STRING1"
    const lower1 = "string1"
    const mixed1 = "sTrInG1"
    
    expect(strComp.insensitive(upper1, lower1)).toEqual(0)
    expect(strComp.insensitive(upper1, mixed1)).toEqual(0)
    expect(strComp.insensitive(lower1, mixed1)).toEqual(0)
})


test('insensitive(): properly returns comparison 1 (longer)', () => {
    const stringLonger = "STRING1LONGER"
    const stringShorter = "string1"
    
    expect(strComp.insensitive(stringLonger, stringShorter)).toEqual(1)
})


test('insensitive(): properly returns comparison -1 (not equal)', () => {
    const upper1 = "STRING1"
    const lower1 = "string1"
    const mixed1 = "sTrInG1"
    const upper2 = "STRING2"
    const lower2 = "string2"
    const mixed2 = 'StRiNg2'
    const stringLonger = "STRING1LONGER"
    const stringShorter = "string1"

    expect(strComp.insensitive(upper1, upper2)).toEqual(-1)
    expect(strComp.insensitive(lower1, lower2)).toEqual(-1)
    expect(strComp.insensitive(mixed1, mixed2)).toEqual(-1)
    expect(strComp.insensitive(stringShorter, stringLonger)).toEqual(-1)
})