const { setTimeout } = require('node:timers/promises')
const EventEmitter = require('node:events')

const asyncLimit = require('./asyncLimit')


const forceError = async function forceError() {
    throw Error("Forced an error!")
}


test('validate 10 async tasks with limit 1', async() => {
    const eventEmitter = new EventEmitter()
    const tasks = [
        () => setTimeout(20, 'Completed timeout of 20ms'),
        () => setTimeout(1, 'Completed timeout of 1ms'),
        () => setTimeout(19, 'Completed timeout of 19ms'),
        () => setTimeout(100, 'Completed timeout of 100ms'),
        () => setTimeout(23, 'Completed timeout of 23ms'),
        () => setTimeout(93, 'Completed timeout of 93ms'),
        () => setTimeout(20, 'Completed timeout of 20ms'),
        () => setTimeout(26, 'Completed timeout of 26ms'),
        () => setTimeout(14, 'Completed timeout of 14ms'),
        () => setTimeout(0, 'Completed timeout of 0ms')
    ]
    const limitConcurrency = 1
    const result = await asyncLimit(limitConcurrency, tasks, eventEmitter)

    expect(result.length).toEqual(10)
    expect(result).toContainEqual(expect.stringMatching(/Completed timeout of 100ms/))
})


test('validate 10 async tasks with limit 10', async() => {
    const eventEmitter = new EventEmitter()
    const tasks = [
        () => setTimeout(20, 'Completed timeout of 20ms'),
        () => setTimeout(1, 'Completed timeout of 1ms'),
        () => setTimeout(19, 'Completed timeout of 19ms'),
        () => setTimeout(100, 'Completed timeout of 100ms'),
        () => setTimeout(23, 'Completed timeout of 23ms'),
        () => setTimeout(93, 'Completed timeout of 93ms'),
        () => setTimeout(20, 'Completed timeout of 20ms'),
        () => setTimeout(26, 'Completed timeout of 26ms'),
        () => setTimeout(14, 'Completed timeout of 14ms'),
        () => setTimeout(0, 'Completed timeout of 0ms')
    ]
    const limitConcurrency = 10
    const result = await asyncLimit(limitConcurrency, tasks, eventEmitter)

    expect(result.length).toEqual(10)
    expect(result).toContainEqual(expect.stringMatching(/Completed timeout of 100ms/))
})


test('validate 10 async tasks with limit 20', async() => {
    const eventEmitter = new EventEmitter()
    const tasks = [
        () => setTimeout(20, 'Completed timeout of 20ms'),
        () => setTimeout(1, 'Completed timeout of 1ms'),
        () => setTimeout(19, 'Completed timeout of 19ms'),
        () => setTimeout(100, 'Completed timeout of 100ms'),
        () => setTimeout(23, 'Completed timeout of 23ms'),
        () => setTimeout(93, 'Completed timeout of 93ms'),
        () => setTimeout(20, 'Completed timeout of 20ms'),
        () => setTimeout(26, 'Completed timeout of 26ms'),
        () => setTimeout(14, 'Completed timeout of 14ms'),
        () => setTimeout(0, 'Completed timeout of 0ms')
    ]
    const limitConcurrency = 20
    const result = await asyncLimit(limitConcurrency, tasks, eventEmitter)

    expect(result.length).toEqual(10)
    expect(result).toContainEqual(expect.stringMatching(/Completed timeout of 100ms/))
})


test('validate tasks that return an error', async() => {
    const eventEmitter = new EventEmitter()
    const tasks = [
        () => forceError()
    ]
    const limitConcurrency = 10
    const result = await asyncLimit(limitConcurrency, tasks, eventEmitter)
    
    expect(result.length).toEqual(1)
    expect(result[0].message).toMatch(/Forced an error!/)
})