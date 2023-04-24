const numberFunctions = require('./numberFunctions')
const number = new numberFunctions()

test('withCommas(): properly returns number with commas', () => {
    const number1 = 3943434
    expect(number.withCommas(number1)).toEqual("3,943,434")

    const number2 = 844
    expect(number.withCommas(number2)).toEqual("844")

    const number3 = 2345
    expect(number.withCommas(number3)).toEqual("2,345")

    const number4 = "2345"
    expect(number.withCommas(number4)).toEqual("2,345")
})