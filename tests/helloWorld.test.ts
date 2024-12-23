const assert = require('assert');



function helloWorld() {
    return 'Hello, World!';
}

describe('helloWorld', () => {
    it('should return "Hello, World!"', () => {
        assert.strictEqual(helloWorld(), 'Hello, World!');
    });
});
