'use strict';
/**
 * Implementation of the caching layer using Redis.
 * A persistent Redis connection per Node js worker is maintained and this connection is singleton.<br><br>
 *
 * @module lib/cache/redis
 */
// Load External packages
const redis = require("redis");

// Load internal libraries
const rootPrefix = "../.."
  , cacheConfig = require(rootPrefix + '/config/cache')
  , helper = require(rootPrefix + '/lib/cache/helper')
  , responseHelper = require(rootPrefix + '/lib/formatter/response')
;

// Create connections
const clientOptions = {
  host: cacheConfig.REDIS_HOST,
  port: cacheConfig.REDIS_PORT,
  password: cacheConfig.REDIS_PASS,
  tls: cacheConfig.REDIS_TLS_ENABLED
}
  , client = redis.createClient(clientOptions)
  , defaultLifetime = Number(cacheConfig.DEFAULT_TTL);

/**
 * Constructor for redis implementation
 *
 * @constructor
 */
const redisCache = function () {
};

redisCache.prototype = {

  /**
   * Get the stored value for the given key.
   *
   * @param {string} key - cache key
   *
   * @return {Promise<Result>} - On success, data.value has value. On failure, error details returned.
   */
  get: function (key) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_g_1', 'Cache key validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_g_2', err));
        } else {
          onResolve(responseHelper.successWithData({response: data}));
        }
      };

      // Perform action
      client.get(key, callback);
    });
  },

  /**
   * Get the stored object value for the given key.
   *
   * @param {string} key - cache key
   *
   * @return {Promise<Result>} - On success, data.value has value. On failure, error details returned.
   */
  getObject: function (key) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_go_1', 'Cache key validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_go_2', err));
        } else {
          // format data
          for (var i in data) {
            data[i] = JSON.parse(data[i]);
          };
          onResolve(responseHelper.successWithData({response: data}));
        }
      };

      // Perform action
      client.hgetall(key, callback);
    });
  },

  /**
   * Set a new key value or update the existing key value in cache
   *
   * @param {string} key - cache key
   * @param {mixed} value - number/string value that you want to store.
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  set: function (key, value) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_s_1', 'Cache key validation failed'));
      }
      if ((typeof value === 'object') || helper.validateCacheValue(value) === false) {
        return onResolve(responseHelper.error('l_c_r_s_2', 'Cache value validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_s_3', err));
        } else {
          onResolve(responseHelper.successWithData({response: true}));
        }
      };

      // Perform action
      client.set(key, value, 'EX', defaultLifetime, callback);
    });
  },

  /**
   * Set a new key object or update the existing key object in cache
   *
   * @param {string} key - cache key
   * @param {object} object - object value that you want to store.
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  setObject: function (key, object) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_so_1', 'Cache key validation failed'));
      }
      if ((typeof object !== 'object') || helper.validateCacheValue(object) === false) {
        return onResolve(responseHelper.error('l_c_r_so_2', 'Cache value validation failed'));
      }

      // Set callback method
      var callback = function (err, res) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_so_3', err));
        } else {
          onResolve(responseHelper.successWithData({response: true}));
        }
      };

      // format data
      var arrayRepresentation = [];
      for (var i in object) {
        arrayRepresentation.push(i);
        arrayRepresentation.push(JSON.stringify(object[i]));
      };

      // Perform action
      client.hmset(key, arrayRepresentation, callback);
    });
  },

  /**
   * Delete the key from cache
   *
   * @param {string} key - cache key
   *
   * @return {Promise<Result>} - On success, data.value is true. On failure, error details returned.
   */
  del: function (key) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if (helper.validateCacheKey(key) === false) {
        return onResolve(responseHelper.error('l_c_r_d_1', 'Cache key validation failed'));
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_d_2', err));
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
  multiGet: function (keys) {
    return new Promise(function (onResolve, onReject) {
      // error handling
      if(!Array.isArray(keys) || keys.length==0) {
        return onResolve(responseHelper.error('l_c_r_mg_1', 'Cache keys should be an array'));
      }
      for (var i = 0; i < keys.length; i++) {
        if (helper.validateCacheKey(keys[i]) === false) {
          return onResolve(responseHelper.error('l_c_r_mg_2', 'Cache key validation failed'));
        }
      }

      // Set callback method
      var callback = function (err, data) {
        if (err) {
          onResolve(responseHelper.error('l_c_r_mg_3', err));
        } else {
          var retVal = {};
          for (var i = 0; i < keys.length; i++) {
            retVal[keys[i]] = data[i];
          }
          onResolve(responseHelper.successWithData({response: retVal}));
        }
      };

      // Perform action
      client.mget(keys, callback);
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
  increment: function (key, byValue) {
    if (byValue) {
      return helper.promisifyMethod(client, 'incrby', [key, byValue]);
    } else {
      // if the byValue is not passed, we will increment by 1
      return helper.promisifyMethod(client, 'incr', [key]);
    }
  },

  /**
   * Decrement the numeric value for the given key, if key already exists.
   *
   * @param {string} key - cache key
   * @param {number} byValue - number that you want to decrement by
   *
   * @return {Promise<boolean>} A promise to decrement the numeric value.  On resolve, the boolean flag indicates if value was decremented successfully or not.
   */
  decrement: function (key, byValue) {
    if (byValue) {
      return helper.promisifyMethod(client, 'decrby', [key, byValue]);
    } else {
      // if the byValue is not passed, we will decrement by 1
      return helper.promisifyMethod(client, 'decr', [key]);
    }
  },

  /**
   * Find cached key and set its new expiry time.
   *
   * @param {string} key - cache key
   * @param {integer} lifetime - number that you want to set as expiry
   *
   * @return {Promise<boolean>} A promise to update the expiry of record.  On resolve, the boolean flag indicates if record was updated successfully or not.
   */
  touch: function (key, lifetime) {
    return helper.promisifyMethod(client, 'expire', [key, lifetime]);
  }
};

module.exports = new redisCache();