const path = require('node:path')

const htmlResults = require('./htmlResults')
const html = new htmlResults()

test('getCollectionHtmlReport(): properly gets collectionHtmlReport for a valid collectionTemplatePath', async() => {
    const collectionTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-collection.hbs')
    const collectionResults = {}
    const collectionHtmlReport = await html.getCollectionHtmlReport(collectionTemplatePath, collectionResults)

    expect(collectionHtmlReport).toContain('</html>')
})


test('getCollectionHtmlReport(): returns proper error for invalid collectionTemplatePath', async() => {
    const collectionTemplatePath = path.join(__dirname, 'does-not-exist', 'template-xrun-collection.hbs')
    const collectionResults = {}
    

    await expect(html.getCollectionHtmlReport(collectionTemplatePath, collectionResults)).rejects.toThrow(/Oops, unable to read collection template file /)
})


test('getSummaryHtmlReport(): properly gets summaryHtmlReport for a valid summaryTemplatePath', async() => {
    const summaryTemplatePath = path.join(__dirname, 'html-templates', 'template-xrun-summary.hbs')
    const testResultSummary = {}
    const summaryHtmlReport = await html.getSummaryHtmlReport(summaryTemplatePath, testResultSummary)

    expect(summaryHtmlReport).toContain('</html>')
})


test('getSummaryHtmlReport(): returns proper error for invalid summaryTemplatePath', async() => {
    const summaryTemplatePath = path.join(__dirname, 'does-not-exist', 'template-xrun-summary.hbs')
    const testResultSummary = {}
    

    await expect(html.getSummaryHtmlReport(summaryTemplatePath, testResultSummary)).rejects.toThrow(/Oops, unable to read summary template file /)
})