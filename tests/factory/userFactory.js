const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = async () => {
    const user = await new User({}).save();
    return user;
}