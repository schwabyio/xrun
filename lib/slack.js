////////////////////////////////////////////////////////////////////////////////
//   slack.js - Slack functions.                                              //
//                                                                            //
//                Created by: schwaby.io                                      //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
const { WebClient } = require('@slack/web-api')


//////////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////////
function slack(slackToken) {
    const self = this
    const web = new WebClient(slackToken)


    //////////////////////////////////////////////////////////////////////////////
    //
    //   slackObject = {}
    //   slackObject['channel'] = <channelId>
    //   slackObject['username'] = <username>
    //   slackObject['icon_emoji'] = <icon_emoji>
    //   slackObject['text'] = <text>
    //
    //////////////////////////////////////////////////////////////////////////////
    self.postMessage = function postMessage(slackObject, callback) {

        (async () => {
            try {
              //Slack API
              const result = await web.chat.postMessage(slackObject)
      
              return callback(null)
      
            } catch (error) {
              const errMsg = "Oops, got the following error trying to post a slack message: " + error
              return callback(errMsg)
            }
          })()
    }
}

module.exports = slack