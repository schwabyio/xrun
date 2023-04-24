////////////////////////////////////////////////////////////////////////////////
//    asyncLimit.js - Run array of async functions concurrently with a limit. //
//                                                                            //
//                Created by: schwaby.io                                      //
//    Adapted from:															  //
//    https://maximorlov.com/parallel-tasks-with-pure-javascript              //
////////////////////////////////////////////////////////////////////////////////
const asyncLimit = async function asyncLimit (limitConcurrency, tasks, eventEmitter) {
	const results = []
	const iterator = tasks.entries()
	const workers = Array(limitConcurrency).fill(iterator).map(runTasks)

	async function runTasks(iterator) {
		for (const [index, task] of iterator) {
			try {
				const result = await task()
				results.push(result)

				eventEmitter.emit('taskCompleted', results.length, result)
			} catch (error) {
				const result = new Error(`${error.message}`)
				results.push(result)

				eventEmitter.emit('taskError', results.length, result)
			}
		}
	}

	await Promise.allSettled(workers)

	return results
}

module.exports = asyncLimit