const getHostName = require('./getHostName')


test('properly returns a raw hostName', () => {
    const hostName = new getHostName()
    const hostNameRaw = hostName.raw()

    expect(typeof hostNameRaw).toBe("string")
})


test('properly returns short', () => {
    const hostName = new getHostName()

    expect(hostName.short('short')).toEqual('short')
})


test('properly returns some-made-up-hostname', () => {
    const hostName = new getHostName()

    expect(hostName.short('some-made-up-hostname.made-up-extension@made-up-domain.com')).toEqual('some-made-up-hostname')
})


test('properly returns Johnnys-iMac', () => {
    const hostName = new getHostName()

    expect(hostName.short('Johnnys-iMac.local')).toEqual('Johnnys-iMac')
})