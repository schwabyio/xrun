////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//   httpClient.js - Light-weight http(s) client.                             //
//                                                                            //
//                Created by: schwaby.io                                      //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
var path = require('path')
var http = require('http')
var https = require('https')
var url = require('url')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
function httpClient(request, callback) {
  var errMsg = ''
  var urlObject = url.parse(request.url)
  var httpOptions = {}
  var client = {}
  var response = {}

  //Set httpOptions
  httpOptions['protocol'] = urlObject.protocol
  httpOptions['hostname'] = urlObject.hostname
  httpOptions['port'] = urlObject.port
  httpOptions['path'] = urlObject.path
  httpOptions['method'] = request.method
  httpOptions['headers'] = request.headers
  httpOptions['requestBody'] = request.body || ''
  httpOptions['timeout'] = request.timeout || 120000
  if (request.auth) {
    httpOptions['auth'] = request.auth
  }


  if (urlObject.protocol === 'http:') {
    //Set agent
    httpOptions['agent'] = new http.Agent({ keepAlive: true })

    //http request
    client = http.request(httpOptions, function resultOfHttpRequest(response) {
      //Initialize special response properties
      response['httpClientRawRequest'] = ''
      response['httpClientRawResponse'] = 'N/A'
      response['httpClientResponseBody'] = ''

      response.on('data', function resultOfData(chunk) {
        response['httpClientResponseBody'] += chunk.toString('utf8')
      })

      response.on('end', function httpResponseComplete() {
        setRawRequest(request, response)
        setRawResponse(request, response)

        httpOptions['agent'].destroy()

        return callback(null, response)
      })
    })
  } else if (urlObject.protocol === 'https:') {
    //Set agent
    httpOptions['agent'] = new https.Agent({ keepAlive: true })

    //https request
    client = https.request(httpOptions, function resultOfHttpsRequest(response) {
      //Initialize special response properties
      response['httpClientRawRequest'] = ''
      response['httpClientRawResponse'] = 'N/A'
      response['httpClientResponseBody'] = ''

      response.on('data', function resultOfData(chunk) {
        response['httpClientResponseBody'] += chunk.toString('utf8')
      })

      response.on('end', function httpsResponseComplete() {
        setRawRequest(request, response)
        setRawResponse(request, response)

        httpOptions['agent'].destroy()

        return callback(null, response)
      })
    })
  } else {
    errMsg = 'Oops, unsupported protocol: ' + urlObject.protocol
    return callback(errMsg, response)
  }

  client.on('error', function httpClientError(err) {
    //Initialize special response properties
    setRawRequest(request, response)
    response['httpClientRawResponse'] = 'N/A'
    response['httpClientResponseBody'] = ''

    if (err.code === 'ECONNRESET') {
      //From client side, ECONNRESET likely corresponds to timeout
      errMsg = "Oops, the httpClient got an ECONNRESET error possibly due to timeout after " + httpOptions.timeout + "ms."
    } else {
      errMsg = "Oops, the httpClient request failed due to: " + err.code + " - " + err.message
    }

    return callback(errMsg, response)
  })

  client.setTimeout(httpOptions.timeout, function httpClientTimeout() {
    //Timed out, abort request
    client.abort()
  })

  client.write(httpOptions.requestBody)
  client.end()



  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function setRawRequest(request, response) {
    var rawRequest = ''
    var configMessage = ''

    if (request.hasOwnProperty('configsKey')) {
      configMessage = " FOR CONFIG '" + path.basename(request.configsKey) + "'"
    } else {
      configMessage = ''
    }

    //Set rawRequest
    rawRequest = '***HTTP REQUEST' + configMessage + '***' + '\n' +
                 'TIMEOUT: ' + request.timeout + '\n' +
                 'METHOD: ' + request.method + '\n' +
                 'URL: ' + request.url + '\n' +
                 'HEADERS:\n' + request.headers
    if (request.body) {
      rawRequest += 'BODY:\n' + request.body
    }

    response['httpClientRawRequest'] = rawRequest
  }


  //////////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////////
  function setRawResponse(request, response) {
    var rawResponse = ''

    //Set rawResponse
    rawResponse = '***HTTP RESPONSE:***' + '\n' +
                  'STATUS CODE: ' + response.statusCode + '\n' +
                  'HEADERS:\n' + response.headers
    if (response.httpClientResponseBody) {
      rawResponse += 'BODY:\n' + response.httpClientResponseBody
    }

    response['httpClientRawResponse'] = rawResponse
  }
}


module.exports = httpClient
