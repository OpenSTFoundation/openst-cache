'use strict';
/**
 * Implementation of the caching layer using Memcached.<br><br>
 *
 * @module lib/cache/memcached
 */

// Load external packages
const Memcached = require("memcached");

// Load internal libraries and create instances
const rootPrefix = "../.."
  , cacheConfig = require(rootPrefix + '/config/cache')
  , helper = require(rootPrefix + '/lib/cache/helper')
  , client = new Memcached(cacheConfig.MEMCACHE_SERVERS, {retries: 1, timeout: 500, reconnect: 1000})
  , defaultLifetime = Number(cacheConfig.DEFAULT_TTL)
;

// Error handling
client.on('issue', function( details ){console.log("Issue with Memcache server. Trying to resolve!")});
client.on('failure', function( details ){ console.error( "Server " + details.server + "went down due to: " + details.messages.join( '' ) ) });
client.on('reconnecting', function( details ){ console.debug( "Total downtime caused by server " + details.server + " :" + details.totalDownTime + "ms")});

/**
 * Constructor for memcached implementation
 *
 * @constructor
 */
const memcachedCache = function () {
};

memcachedCache.prototype = {

  /**
   * Get the value for the given key.
   *
   * @param {string} key - The key
   *
   * @return {Promise<mixed>} A promise to return value of the key.
   */
  get: function (key) {     
    return helper.promisifyMethod(client, 'get', [key]);    
  },

  /**
   * Get the stored object value for the given key. Internally call get method
   *
   * @param {string} key - cache key
   *
   * @return {Promise<mixed>} A promise to return value of the key.
   */
  getObject: function (key) {
    return this.get(key);
  },

  /**
   * Set a new key value or update the existing key value in cache
   *
   * @param {string} key - cache key
   * @param {mixed} value - JSON/number/string that you want to store.
   *
   * @return {Promise<boolean>} A promise to set the key.  On resolve, the boolean flag indicates if cache was set successfully or not.
   */
  set: function(key, value) {
    if (helper.validateCacheKey(key)===false || helper.validateCacheValue(value)===false){
      return Promise.resolve(false);
    }
    return helper.promisifyMethod(client, 'set', [key, value, defaultLifetime]);        
  },

  /**
   * Set a new key object or update the existing key object in cache. Internally call set method
   *
   * @param {string} key - cache key
   * @param {mixed} object - JSON/number/string value that you want to store.
   *
   * @return {Promise<boolean>} A promise to set the key.  On resolve, the boolean flag indicates if cache was set successfully or not.
   */
  setObject: function (key, object) {
    return this.set(key, object);
  },
  
  /**
   * Delete the key from cache
   *
   * @param {string} key - cache key
   *
   * @return {Promise<boolean>} A promise to delete. On resolve, the boolean flag indicates if key was valid before deleting.
   */
  del: function(key) {
    return helper.promisifyMethod(client, 'del', [key]);      
  },

  /**
   * Get the values of specified keys.
   *
   * @param {array} keys - Array of cache keys
   *
   * @return {Promise<mixed>} A promise to return value of the keys.
   */
  multiGet: function(keys) {
    return helper.promisifyMethod(client, 'getMulti', [keys]);      
  },

  /**
   * Increment the numeric value for the given key, if key already exists.
   *
   * @param {string} key - cache key
   * @param {number} byValue - number that you want to increment by
   *
   * @return {Promise<boolean>} A promise to increment the numeric value.  On resolve, the boolean flag indicates if value was incremented successfully or not.
   */
  increment: function(key, byValue) { 
    const value = byValue ? byValue : 1;   
    return helper.promisifyMethod(client, 'incr', [key, value]);
  },

  /**
   * Decrement the numeric value for the given key, if key already exists.
   *
   * @param {string} key - cache key
   * @param {number} byValue - number that you want to decrement by
   *
   * @return {Promise<boolean>} A promise to decrement the numeric value.  On resolve, the boolean flag indicates if value was decremented successfully or not.
   */
  decrement: function(key, byValue) {    
    const value = byValue ? byValue : 1;   
    return helper.promisifyMethod(client, 'decr', [key, value]);    
  },

  /**
   * Find cached key and set its new expiry time.
   * @param {string} key - cache key
   * @param {integer} lifetime - number that you want to set as expiry
   *
   * @return {Promise<boolean>} A promise to update the expiry of record.  On resolve, the boolean flag indicates if record was updated successfully or not.
   */
  touch: function (key, lifetime) {
    return helper.promisifyMethod(client, 'touch', [key, lifetime]);      
  }

};

module.exports = new memcachedCache();
