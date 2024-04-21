
const Buffer = require('safe-buffer').Buffer;
const cookieKey = require('../../config/keys').cookieKey;
const Keygrip = require('keygrip');
const keys = new Keygrip([cookieKey]);

module.exports = (user) => {
  
    const sessionObject = {
      passport: {
        user: user._id.toString()
      }
    };

    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
  
    const sig = keys.sign('session=' + session);

    return { session, sig }
}