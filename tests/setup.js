jest.setTimeout(30000);

// code in the User.js model file will get executed in the test evironment
require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.connect(keys.mongoURI);