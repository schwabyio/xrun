const Slack = require('./slack')

const slack = new Slack('123456')


test('properly throws error for bad token', async() => {
    const slackObject = {}
    slackObject['channel'] = "12345"
    slackObject['username'] = "username"
    slackObject['icon_emoji'] = ":pass:"
    slackObject['text'] = "This is a test message"

    await expect(slack.postMessage(slackObject)).rejects.toThrow(/Oops, got the following error trying to post a slack message: An API error occurred: invalid_auth/)
})