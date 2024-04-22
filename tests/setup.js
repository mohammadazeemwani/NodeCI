jest.setTimeout(30000);
const mongoose = require("mongoose");
const keys = require("../config/keys");
require("../models/User");

// code in the User.js model file will get executed in the test evironment
beforeAll(() => {
  return mongoose.connect(keys.mongoURI);
});

afterAll(() => {
    return mongoose.disconnect();
});