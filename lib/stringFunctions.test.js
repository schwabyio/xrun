const stringFunctions = require('./stringFunctions')
const strFunc = new stringFunctions()

test('replaceSpecialChars(): properly returns replaced special characters', () => {
    const special1 = "This is a \\string\\"
    expect(strFunc.replaceSpecialChars(special1)).toEqual("This is a -string-")

    const special2 = "This is a \/string\/"
    expect(strFunc.replaceSpecialChars(special2)).toEqual("This is a -string-")
})


test('padStart(): properly returns pad to start of string', () => {
    const padStartString1 = "This is a string"
    expect(strFunc.padStart(padStartString1, 40, ' ')).toEqual("                        This is a string")

    const padStartString2 = "This is a string"
    expect(strFunc.padStart(padStartString2, 10, ' ')).toEqual("This is a string")

    const padStartString3 = "This is a string"
    expect(strFunc.padStart(padStartString2, 16, ' ')).toEqual("This is a string")
})

test('padStart(): properly returns pad to start of string when optional characterToPad not provided', () => {
    const padStartString1 = "This is a string"
    expect(strFunc.padStart(padStartString1, 17)).toEqual(" This is a string")
})

test('padEnd(): properly returns pad to end of string', () => {
    const padEndString1 = "This is a string"
    expect(strFunc.padEnd(padEndString1, 40, ' ')).toEqual("This is a string                        ")

    const padEndString2 = "This is a string"
    expect(strFunc.padEnd(padEndString2, 10, ' ')).toEqual("This is a string")

    const padEndString3 = "This is a string"
    expect(strFunc.padEnd(padEndString3, 16, ' ')).toEqual("This is a string")
})

test('padEnd(): properly returns pad to end of string when optional characterToPad not provided', () => {
    const padEndString1 = "This is a string"
    expect(strFunc.padEnd(padEndString1, 17)).toEqual("This is a string ")
})