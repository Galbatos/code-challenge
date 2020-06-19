/* Passing e5fa44f2b31c1fb553b6021e7360d07d5d91ff5e should get back
* e5fa44f2b31c1fb553b6021e7360d07d5d91ff5e: 2c8
*/
const { createHash } = require('crypto');

/**
* Simple proof of work: concatenate the input string with a nonce, returning
* the nonce when the last 3 digits of the hex-encoded SHA256 hash are '000'.
* This version calculates the nonce by incrementing a number and converting it
* to a hex string.
*
* @param  String input The starting string.
* @return String       The computed nonce.
*/
const work = function (input) {
    var id = 0;
    while (true) {
        var nonce = id.toString(16);

        var sha256 = createHash('sha256');
        sha256.update(input);
        sha256.update(nonce);

        if (sha256.digest('hex').slice(-3) === '000') {
            return nonce;
        }
        else id++;
    }
}

module.exports = work