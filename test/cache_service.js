// Load external packages
const chai = require('chai')
  , assert = chai.assert;

// Load cache service
const rootPrefix = ".."
  , openSTCache = require(rootPrefix + '/services/cache')
  , cacheConfig = require(rootPrefix + '/config/cache')
;

// Set Method
describe('Cache Set', function() {

  it('should return promise', async function() {
    var cKey = "cache-key"
      , cValue = "String Value"
      , response = openSTCache.set(cKey, cValue);
    assert.typeOf(response, 'Promise');
  });

  it('should return false when key/value is not passed', async function() {
    var response = await openSTCache.set();
    assert.equal(response, false);
  });

  it('should return false when key is undefined', async function() {
    var cValue = "String Value"
      , response = await openSTCache.set(undefined, cValue);
    assert.equal(response, false);
  });

  it('should return false when key is blank', async function() {
    var cKey = ''
      , cValue = "String Value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response, false);
  });

  it('should return false when key is number', async function() {
    var cKey = 10
      , cValue = "String Value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response, false);
  });

  it('should return false when key has space', async function() {
    var cKey = "a b"
      , cValue = "String Value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response, false);
  });

  it('should return false when key length is > 250 chars', async function() {
    var cKey = Array(252).join('x')
      , cValue = "String Value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response, false);
  });

  if (cacheConfig.CACHING_ENGINE != 'redis') {
    it('should return true when value is Object', async function() {
      var cKey = "cache-key"
        , cValue = {a: 1}
        , response = await openSTCache.set(cKey, cValue);
      assert.equal(response, true);
    });
  } else {
    it('should return false when value is Object', async function() {
      var cKey = "cache-key"
        , cValue = {a: 1}
        , response = await openSTCache.set(cKey, cValue);
      assert.equal(response, false);
    });
  }

  it('should return false when value is undefined', async function() {
    var cKey = "cache-key"
      , response = await openSTCache.set(cKey);
    assert.equal(response, false);
  });

  it('should return false when value size is > 1 MB', async function() {
    var cKey = "cache-key"
      , cValue = Array(1050000).join('x')
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response, false);
  });

  it('should return true when value is string', async function() {
    var cKey = "cache-key"
      , cValue = "String Value"
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response, true);
  });

  it('should return true when value is integer', async function() {
    var cKey = "cache-key"
      , cValue = 10
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response, true);
  });

  it('should return true when value is blank', async function() {
    var cKey = "cache-key"
      , cValue = ""
      , response = await openSTCache.set(cKey, cValue);
    assert.equal(response, true);
  });

});