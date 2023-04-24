const timeFunctions = require('./timeFunctions')
const time = new timeFunctions()


test('inSeconds(): properly returns time inSeconds', () => {
    expect(typeof time.inSeconds()).toBe("number")
    expect(time.inSeconds().toString()).toHaveLength(10)
})


test('millisecondsToReadableFormat(): properly returns a readable format for milliseconds', () => {
    expect(time.millisecondsToReadableFormat(493303631)).toBe("137h 1m")

    expect(time.millisecondsToReadableFormat(0)).toBe("0.000s")

    expect(time.millisecondsToReadableFormat(1000)).toBe("1.000s")

    expect(time.millisecondsToReadableFormat(60000)).toBe("1m 0s")
})



test('differenceReadableFormat(): properly returns time difference in a readable format', () => {
    const time1 = time.inSeconds()
    const time2 = time1 + 10
    expect(time.differenceReadableFormat(time1, time2)).toBe("10 seconds")
})


test('convertSecondsToReadableFormat(): properly returns time in seconds to a readable format', () => {
    expect(time.convertSecondsToReadableFormat(0)).toBe("< 1 second")

    expect(time.convertSecondsToReadableFormat(1)).toBe("1 second")

    expect(time.convertSecondsToReadableFormat(2)).toBe("2 seconds")

    expect(time.convertSecondsToReadableFormat(9)).toBe("9 seconds")

    expect(time.convertSecondsToReadableFormat(59)).toBe("59 seconds")

    expect(time.convertSecondsToReadableFormat(60)).toBe("1 minute ")

    expect(time.convertSecondsToReadableFormat(61)).toBe("1 minute 1 second")

    expect(time.convertSecondsToReadableFormat(62)).toBe("1 minute 2 seconds")

    expect(time.convertSecondsToReadableFormat(120)).toBe("2 minutes ")

    expect(time.convertSecondsToReadableFormat(121)).toBe("2 minutes 1 second")

    expect(time.convertSecondsToReadableFormat(122)).toBe("2 minutes 2 seconds")

    expect(time.convertSecondsToReadableFormat(3540)).toBe("59 minutes ")

    expect(time.convertSecondsToReadableFormat(3599)).toBe("59 minutes 59 seconds")

    expect(time.convertSecondsToReadableFormat(3600)).toBe("1 hour ")

    expect(time.convertSecondsToReadableFormat(3601)).toBe("1 hour 1 second")

    expect(time.convertSecondsToReadableFormat(3660)).toBe("1 hour 1 minute ")

    expect(time.convertSecondsToReadableFormat(3661)).toBe("1 hour 1 minute 1 second")

    expect(time.convertSecondsToReadableFormat(3662)).toBe("1 hour 1 minute 2 seconds")

    expect(time.convertSecondsToReadableFormat(3720)).toBe("1 hour 2 minutes ")

    expect(time.convertSecondsToReadableFormat(3721)).toBe("1 hour 2 minutes 1 second")

    expect(time.convertSecondsToReadableFormat(3722)).toBe("1 hour 2 minutes 2 seconds")

    expect(time.convertSecondsToReadableFormat(7200)).toBe("2 hours ")

    expect(time.convertSecondsToReadableFormat(7260)).toBe("2 hours 1 minute ")

    expect(time.convertSecondsToReadableFormat(7261)).toBe("2 hours 1 minute 1 second")

    expect(time.convertSecondsToReadableFormat(7320)).toBe("2 hours 2 minutes ")

    expect(time.convertSecondsToReadableFormat(7321)).toBe("2 hours 2 minutes 1 second")

    expect(time.convertSecondsToReadableFormat(7322)).toBe("2 hours 2 minutes 2 seconds")

    expect(time.convertSecondsToReadableFormat(86399)).toBe("23 hours 59 minutes 59 seconds")

    expect(time.convertSecondsToReadableFormat(86400)).toBe("1 day ")

    expect(time.convertSecondsToReadableFormat(86460)).toBe("1 day 1 minute ")

    expect(time.convertSecondsToReadableFormat(86461)).toBe("1 day 1 minute 1 second")

    expect(time.convertSecondsToReadableFormat(86520)).toBe("1 day 2 minutes ")

    expect(time.convertSecondsToReadableFormat(86521)).toBe("1 day 2 minutes 1 second")

    expect(time.convertSecondsToReadableFormat(86522)).toBe("1 day 2 minutes 2 seconds")

    expect(time.convertSecondsToReadableFormat(172800)).toBe("2 days ")

    expect(time.convertSecondsToReadableFormat(172801)).toBe("2 days 1 second")

    expect(time.convertSecondsToReadableFormat(172860)).toBe("2 days 1 minute ")

    expect(time.convertSecondsToReadableFormat(172861)).toBe("2 days 1 minute 1 second")

    expect(time.convertSecondsToReadableFormat(172921)).toBe("2 days 2 minutes 1 second")

    expect(time.convertSecondsToReadableFormat(172922)).toBe("2 days 2 minutes 2 seconds")

    expect(time.convertSecondsToReadableFormat(259200)).toBe("3 days ")
})