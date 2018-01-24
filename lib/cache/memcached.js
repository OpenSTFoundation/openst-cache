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
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
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
   * @return {Promise<Result>} - On success, data.value has value. On failure, error details returned.
   */
  get: function (key) {     
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_m_g_1', 'Cache key validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_g_2', err));
        } else {
          onResolve(responseHelper.successWithData({response: data}));
        }
      };

      // Perform action
      client.get(key, callback);
    });
  },

  /**
   * Get the stored object value for the given key. Internally call get method
   *
   * @param {string} key - cache key
   *
   * @return {Promise<Result>} - On success, data.value has value. On failure, error details returned.
   */
  getObject: function (key) {
    // Perform action
    return this.get(key);
  },

  /**
   * Set a new key value or update the existing key value in cache
   *
   * @param {string} key - cache key
   * @param {mixed} value - JSON/number/string that you want to store.
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  set: function(key, value) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_m_s_1', 'Cache key validation failed'));
      }
      if (helper.validateCacheValue(value) === false) {
        return onResolve(responseHelper.error('l_c_m_s_2', 'Cache value validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_s_3', err));
        } else {
          onResolve(responseHelper.successWithData({response: true}));
        }
      };

      // Perform action
      client.set(key, value, defaultLifetime, callback);
    });
  },

  /**
   * Set a new key object or update the existing key object in cache. Internally call set method
   *
   * @param {string} key - cache key
   * @param {mixed} object - JSON/number/string value that you want to store.
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  setObject: function (key, object) {
    // validate value
    if (typeof object !== 'object') {
      return Promise.resolve(responseHelper.error('l_c_m_so_1', 'Cache value validation failed'));
    }

    // Perform action
    return this.set(key, object);
  },
  
  /**
   * Delete the key from cache
   *
   * @param {string} key - cache key
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  del: function(key) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_m_d_1', 'Cache key validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_d_2', err));
        } else {
          onResolve(responseHelper.successWithData({response: true}));
        }
      };

      // Perform action
      client.del(key, callback);
    });
  },

  /**
   * Get the values of specified keys.
   *
   * @param {array} keys - Array of cache keys
   *
   * @return {Promise<Result>} - On success, data.value is object of key and values. On failure, error details returned.
   */
  multiGet: function(keys) {
    //return helper.promisifyMethod(client, 'getMulti', [keys]);

    return new Promise(function (onResolve, onReject) {
      // error handling
      if(!Array.isArray(keys) || keys.length==0) {
        return onResolve(responseHelper.error('l_c_m_mg_1', 'Cache keys should be an array'));
      }
      for (var i = 0; i < keys.length; i++) {
        if (helper.validateCacheKey(keys[i]) === false) {
          return onResolve(responseHelper.error('l_c_m_mg_2', 'Cache key validation failed'));
        }
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_m_g_2', err));
        } else {
          // match behaviour with redis
          for (var i = 0; i < keys.length; i++) {
            data[keys[i]] = (typeof data[keys[i]] === 'object' || data[keys[i]] === undefined) ? null : data[keys[i]];
          }
          onResolve(responseHelper.successWithData({response: data}));
        }
      };

      // Perform action
      client.getMulti(keys, callback);
    });
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
