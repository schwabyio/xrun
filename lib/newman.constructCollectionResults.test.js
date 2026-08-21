const Newman = require('./newman')
const newman = new Newman()


const buildSummary = function buildSummary(executionList, options) {
    const summaryOptions = options || {}
    const summary = {}

    summary['collection'] = {"name": 'MY_COLLECTION'}

    if (summaryOptions.hasOwnProperty('collectionDescription')) {
        summary['collection']['description'] = {"content": summaryOptions.collectionDescription}
    }

    summary['run'] = {
        "executions": executionList,
        "failures": summaryOptions.failures || [],
        "timings": {"started": 0, "completed": 1000, "responseAverage": 5.4},
        "stats": {
            "assertions": {"total": summaryOptions.assertionsTotal || 1, "failed": summaryOptions.assertionsFailed || 0},
            "iterations": {"total": 1}
        }
    }

    return summary
}


const buildExecution = function buildExecution(options) {
    const executionOptions = options || {}
    const execution = {}

    execution['cursor'] = {"iteration": 0}
    execution['item'] = {"id": 'step-id', "name": executionOptions.name || 'step1'}
    execution['request'] = {
        "method": 'GET',
        "url": executionOptions.hasOwnProperty('url') ? executionOptions.url : {"protocol": 'https', "host": ['example', 'com'], "path": ['test'], "query": []},
        "headers": executionOptions.requestHeaders || [],
        "body": executionOptions.requestBody
    }

    if (executionOptions.noResponse !== true) {
        execution['response'] = {
            "code": 200,
            "status": 'OK',
            "headers": executionOptions.responseHeaders || [],
            "stream": executionOptions.responseBody,
            "responseSize": 100,
            "responseTime": 25
        }
    }

    execution['assertions'] = executionOptions.hasOwnProperty('assertions') ? executionOptions.assertions : [{"assertion": 'an assertion'}]

    return execution
}


test('properly formats a json response body', async() => {
    const execution = buildExecution({
        "responseHeaders": [{"key": 'Content-Type', "value": 'application/json'}],
        "responseBody": Buffer.from('{"id":123}')
    })

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].response.body).toBe('{"id":123}')
    //prism wraps json tokens in span tags
    expect(collectionResults.steps[0].response.bodyHtmlEscaped).toContain('<span class="token')
})


test('properly handles an invalid json response body reported as json', async() => {
    const execution = buildExecution({
        "responseHeaders": [{"key": 'Content-Type', "value": 'application/json'}],
        "responseBody": Buffer.from('this is not json')
    })

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].response.bodyHtmlEscaped).toContain('this is not json')
})


test('properly formats an xml response body', async() => {
    const execution = buildExecution({
        "responseHeaders": [{"key": 'Content-Type', "value": 'application/xml'}],
        "responseBody": Buffer.from('<note><to>xrun</to></note>')
    })

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].response.bodyHtmlEscaped).toContain('<span class="token')
})


test('properly escapes a response body of an unknown content type', async() => {
    const execution = buildExecution({
        "responseHeaders": [{"key": 'Content-Type', "value": 'text/plain'}],
        "responseBody": Buffer.from('<b>not html</b>')
    })

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].response.bodyHtmlEscaped).toBe('&lt;b&gt;not html&lt;/b&gt;')
})


test('properly escapes a response body when there is NO content type header', async() => {
    const execution = buildExecution({"responseBody": Buffer.from('<b>not html</b>')})

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].response.bodyHtmlEscaped).toBe('&lt;b&gt;not html&lt;/b&gt;')
})


test('properly handles an execution with NO response', async() => {
    const execution = buildExecution({"noResponse": true})

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].response.code).toBe('')
    expect(collectionResults.steps[0].response.status).toBe('')
    expect(collectionResults.steps[0].response.headers).toEqual([])
})


test('properly constructs a raw request body', async() => {
    const execution = buildExecution({
        "requestHeaders": [{"key": 'Content-Type', "value": 'application/json'}],
        "requestBody": {"mode": 'raw', "raw": '{"name":"xrun"}'}
    })

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].request.body).toBe('{"name":"xrun"}')
})


test('properly ignores a request body that is NOT raw mode', async() => {
    const execution = buildExecution({"requestBody": {"mode": 'formdata', "formdata": []}})

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].request.body).toBeUndefined()
})


test('properly constructs the request url including the port', async() => {
    const execution = buildExecution({
        "url": {"protocol": 'http', "host": ['localhost'], "port": '8080', "path": ['api', 'v1'], "query": []}
    })

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].request.url).toBe('http://localhost:8080/api/v1')
})


test('properly returns an undefined request url when there is NO host', async() => {
    const execution = buildExecution({"url": {"protocol": 'https', "path": ['test'], "query": []}})

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].request.url).toBeUndefined()
})


test('properly converts request and response headers to a printable string', async() => {
    const execution = buildExecution({
        "requestHeaders": [{"key": 'Accept', "value": 'application/json'}],
        "responseHeaders": [{"key": 'Content-Type', "value": 'application/json'}]
    })

    const collectionResults = newman.constructCollectionResults(buildSummary([execution]))

    expect(collectionResults.steps[0].request.headers).toEqual([{"key": 'Accept', "value": 'application/json'}])
    expect(collectionResults.steps[0].request.headersHtml).toContain('Accept')
})


test('properly uses the collection description when there is one', async() => {
    const collectionResults = newman.constructCollectionResults(buildSummary([buildExecution()], {"collectionDescription": '# My Collection'}))

    expect(collectionResults.collectionDescriptionRaw).toBe('# My Collection')
    expect(collectionResults.collectionDescriptionHtml).toContain('<h1')
})


test('properly defaults the collection description when there is NONE', async() => {
    const collectionResults = newman.constructCollectionResults(buildSummary([buildExecution()]))

    expect(collectionResults.collectionDescriptionRaw).toBe('```<NO CONTENT>```')
})


test('properly counts passed and failed assertions', async() => {
    const execution = buildExecution({
        "assertions": [
            {"assertion": 'passing assertion'},
            {"assertion": 'failing assertion', "error": {"name": 'AssertionError', "message": 'expected 1 to equal 2'}},
            {"assertion": 'skipped assertion', "skipped": true}
        ]
    })

    const collectionResults = newman.constructCollectionResults(buildSummary([execution], {"assertionsTotal": 3, "assertionsFailed": 1}))

    const assertions = collectionResults.steps[0].assertions
    expect(assertions.totalCount).toBe(3)
    expect(assertions.passedCount).toBe(2)
    expect(assertions.failedCount).toBe(1)
    expect(assertions.list[1]).toHaveProperty('failureMessage', 'expected 1 to equal 2')
    expect(assertions.list[2]).toHaveProperty('skipped', true)

    //A step with a failed assertion fails the collection
    expect(collectionResults.steps[0].stepResult).toBe('failed')
    expect(collectionResults.collectionResult).toBe('failed')
    expect(collectionResults.collectionPassed).toBe(false)
})


test('a step with NO assertions is reported as failed', async() => {
    const collectionResults = newman.constructCollectionResults(buildSummary([buildExecution({"assertions": []})]))

    expect(collectionResults.steps[0].stepResult).toBe('failed')
    expect(collectionResults.stepsFailed).toBe(1)
})


test('properly handles an execution with null assertions', async() => {
    const collectionResults = newman.constructCollectionResults(buildSummary([buildExecution({"assertions": null})]))

    expect(collectionResults.steps[0].assertions.passedCount).toBe(0)
    expect(collectionResults.steps[0].assertions.list).toEqual([])
})


test("properly reports a 'request' type failure", async() => {
    const failures = [{
        "at": 'request',
        "error": {"name": 'Error', "message": 'getaddrinfo ENOTFOUND'},
        "source": {"name": 'step1'},
        "cursor": {"iteration": 0}
    }]

    const collectionResults = newman.constructCollectionResults(buildSummary([buildExecution()], {"failures": failures}))

    expect(collectionResults.steps[0].response.failureMessage).toBe("Error with 'request': getaddrinfo ENOTFOUND")
})


test('properly ignores a failure that belongs to a different step', async() => {
    const failures = [{
        "at": 'test-script',
        "error": {"name": 'Error', "message": 'boom'},
        "source": {"name": 'a-different-step'},
        "cursor": {"iteration": 0}
    }]

    const collectionResults = newman.constructCollectionResults(buildSummary([buildExecution()], {"failures": failures}))

    expect(collectionResults.steps[0].response.failureMessage).toBeNull()
})


test('properly ignores a failure that has NO source', async() => {
    const failures = [{
        "at": 'request',
        "error": {"name": 'Error', "message": 'boom'},
        "cursor": {"iteration": 0}
    }]

    const collectionResults = newman.constructCollectionResults(buildSummary([buildExecution()], {"failures": failures}))

    expect(collectionResults.steps[0].response.failureMessage).toBeNull()
})


test('properly tallies collection totals', async() => {
    const executionList = [
        buildExecution({"name": 'step1'}),
        buildExecution({"name": 'step2'})
    ]

    const collectionResults = newman.constructCollectionResults(buildSummary(executionList, {"assertionsTotal": 2, "assertionsFailed": 0}))

    expect(collectionResults.testsTotal).toBe(2)
    expect(collectionResults.testsPassed).toBe(2)
    expect(collectionResults.testsFailed).toBe(0)
    expect(collectionResults.assertionsTotal).toBe(2)
    expect(collectionResults.assertionsPassed).toBe(2)
    expect(collectionResults.executionTimeTotal).toBe(1000)
    expect(collectionResults.responseTimeAverage).toBe(5)
    expect(collectionResults.collectionResult).toBe('passed')
    expect(collectionResults.iterationsTotal).toBe(1)
    expect(collectionResults.dataFilePath).toBeUndefined()
})


test('constructErrorCollectionResults(): properly reports a collection that could NOT be run as failed', async() => {
    const error = new Error('Oops, newman run resulted in the following error: Error: expecting a collection to run')

    const collectionResults = newman.constructErrorCollectionResults(error, 'MY_COLLECTION')

    expect(collectionResults).toHaveProperty('collectionName', 'MY_COLLECTION')
    expect(collectionResults).toHaveProperty('collectionResult', 'failed')
    expect(collectionResults).toHaveProperty('collectionPassed', false)
    expect(collectionResults).toHaveProperty('errorMessage', error.message)

    //No tests or assertions were run
    expect(collectionResults).toHaveProperty('testsTotal', 0)
    expect(collectionResults).toHaveProperty('testsPassed', 0)
    expect(collectionResults).toHaveProperty('testsFailed', 0)
    expect(collectionResults).toHaveProperty('assertionsTotal', 0)
    expect(collectionResults).toHaveProperty('assertionsPassed', 0)
    expect(collectionResults).toHaveProperty('assertionsFailed', 0)
    expect(collectionResults.steps).toEqual([])

    //The printable properties used by the cli output and html reports must all exist
    expect(collectionResults).toHaveProperty('testsTotalPrintable', '0')
    expect(collectionResults).toHaveProperty('assertionsTotalPrintable', '0')
    expect(collectionResults).toHaveProperty('executionTimeTotalPrintable')
    expect(collectionResults).toHaveProperty('dateTimeOfRunPrintable')
    expect(collectionResults).toHaveProperty('xRunVersion')
})


test('constructErrorCollectionResults(): properly escapes the error message for the html report', async() => {
    const error = new Error('Unable to parse <collection> & continue')

    const collectionResults = newman.constructErrorCollectionResults(error, 'MY_COLLECTION')

    expect(collectionResults).toHaveProperty('errorMessageHtml', 'Unable to parse &lt;collection&gt; &amp; continue')
})


test('constructErrorCollectionResults(): properly handles a null error', async() => {
    const collectionResults = newman.constructErrorCollectionResults(null, 'MY_COLLECTION')

    expect(collectionResults).toHaveProperty('errorMessage', 'Unknown error')
    expect(collectionResults).toHaveProperty('collectionResult', 'failed')
})
