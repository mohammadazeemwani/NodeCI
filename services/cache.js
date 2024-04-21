const mongoose = require("mongoose");
const redis = require("redis");
const { createClient } = redis;
const client = createClient();
client.connect();  // default port is 6379 in localhost

// REFERENCE to original exec function
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  // this will create a separate object in heap
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );
  
  // see if we have a value for key in redis
  const cacheValue = await client.hGet(this.hashKey, key);

  // if we do then issue that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);
    Array.isArray(doc)
      ? doc.map((d) => {
          new this.model(d);
        })
      : new this.model(doc); // we are dealing with object
    console.log("SERVED FROM REDIS CACHE");
    // now returning mongoose docuemnt as exec would do.
    return doc;
  }

  // if not store the key in redis and serve the data
  const result = await exec.apply(this, arguments);
  await client.hSet(this.hashKey, key, JSON.stringify(result));
  console.log("SERVED FROM MONGO DB");
  return result;
};



module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}