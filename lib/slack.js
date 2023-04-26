////////////////////////////////////////////////////////////////////////////////
//   slack.js - Slack methods.                                                //
//                                                                            //
//                Created by: schwaby.io                                      //
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
    self.postMessage = async function postMessage(slackObject) {

        try {
          //Slack API
          const result = await web.chat.postMessage(slackObject)
  
          return result
  
        } catch (error) {
          throw new Error("Oops, got the following error trying to post a slack message: " + error.message)
        }
    }
}

module.exports = slack