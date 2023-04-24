const appInfo = require('./appInfo')
const app = new appInfo()

test('properly returns app version', () => {

    expect(typeof app.getVersion()).toBe('string')
})

test('properly returns app name', () => {

    expect(app.getName()).toBe('@schwabyio/xrun')
})

test('properly returns CLI name', () => {

    expect(app.getCLIName()).toBe('xrun')
})