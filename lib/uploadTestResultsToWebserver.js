/*
TODO: 1. Determine webserver to use. 2. Convert to async/await 3. Add unit tests

const admzip = require('adm-zip')

//////////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////////
function uploadTestResultsToWebserver(testResultsHtmlPath, callback) {
    const zip = new admzip()
    const zipFileName = 'xrun-test-results.zip'
    const zipFilePath = path.join(testResultsHtmlPath, zipFileName)
    const requestJsonObject = {}
    const request = {}

    if (self.settings.uploadTestResultsToWebserver === true) {
        process.stdout.write("Uploading test results to webserver...")

        //Zip testResultsHtmlPath to zipFilePath
        zip.addLocalFolder(testResultsHtmlPath)
        zip.writeZip(zipFilePath)

        //Read zipFilePath
        fs.readFile(zipFilePath, function resultOfReadZipFile(err, data) {
        if (err) {
            let errMsg = "Oops, got the following error reading zipFilePath '" + zipFilePath + "': " + err.message
            console.log(errMsg)
            return callback(null)
        } else {
            //Set requestJsonObject
            requestJsonObject['fileName'] = zipFileName
            requestJsonObject['fileType'] = '.zip'
            requestJsonObject['fileData'] = data.toString('base64')
            requestJsonObject['numberOfDaysToKeep'] = self.settings.numberOfDaysToKeepTestResultsOnWebserver

            //Set request
            request['url'] = self.settings['apihubBaseUrl'] + '/v1/static/upload'
            request['method'] = 'POST'
            request['headers'] = { "Content-Type": "application/json", "apihub-token": self.settings['apihubToken']}
            request['body'] = JSON.stringify(requestJsonObject, null, 2)
            request['timeout'] = 600000


            httpClient(request, function resultOfHttpMonitorRequest(errMsg, response) {
            if (errMsg) {
                console.log(errMsg)
                return callback(null)
            } else {
                if (response.statusCode === 200) {
                //Parse out response.httpClientResponseBody
                try {
                    responseJsonObject = JSON.parse(response.httpClientResponseBody)
                } catch (e) {
                    console.log("Oops, got http status code response '" + response.statusCode + "' but unable to parse response body: " + response.httpClientResponseBody)
                    return callback(null)
                }

                let testResultsUrl = responseJsonObject['baseUrl'] + '/summary.html'
                console.log("success!")
                console.log("Test Results: " + testResultsUrl)
                return callback(testResultsUrl)
                } else {
                try {
                    responseJsonObject = JSON.parse(response.httpClientResponseBody)
                    console.log("Oops, got http status code response '" + response.statusCode + "' and error response: " + responseJsonObject.errorMessage)
                    return callback(null)
                } catch (e) {
                    console.log("Oops, got http status code response '" + response.statusCode + "' and unable to parse response body: " + response.httpClientResponseBody)
                    return callback(null)
                }
                }
            }
            })
        }
        })
    } else {
        return callback(null)
    }
}

*/