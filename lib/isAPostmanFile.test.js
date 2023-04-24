const path = require('node:path')

const isAPostmanFile = require('./isAPostmanFile')

test('properly returns true for a valid postman fileName', () => {
    const fileName = path.join('/dkfjdkfjd/dfjkdfjd/dkfjdkfd', 'XTEST_DEMO_EXPECT_RESPONSE_BODY_TO_NOT_HAVE_RESPONSE_PROPERTY.postman_collection.json')

    expect(isAPostmanFile(fileName)).toEqual(true)
})


test('properly returns false for an invalid postman fileName', () => {
    const fileName = path.join('/dkfjdkfjd/dfjkdfjd/dkfjdkfd', 'XTEST_DEMO_EXPECT_RESPONSE_BODY_TO_NOT_HAVE_RESPONSE_PROPERTY.json')

    expect(isAPostmanFile(fileName)).toEqual(false)
})