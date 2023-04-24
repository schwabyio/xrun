const getHostName = require('./getHostName')


test('properly returns a raw hostName', () => {
    const hostName = new getHostName()

    expect(hostName.raw()).toEqual(expect.any(String))
})


test('properly returns a short hostName', () => {
    const hostName = new getHostName()

    expect(hostName.short('short')).toEqual('short')
})


test('properly returns a short hostName', () => {
    const hostName = new getHostName()

    expect(hostName.short('some-made-up-hostname.made-up-extension@made-up-domain.com')).toEqual('some-made-up-hostname')
})