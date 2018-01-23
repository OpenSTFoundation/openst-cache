'use strict';

const helper = {

  // Wrap methodName invocation in a Promise
  promisifyMethod: function (scope, methodName, args) {
    return new Promise(function (onResolve, onReject) {
      args.push(function (err, data) {
        if (err) {
          onReject(err);
        } else {
          onResolve(data)
        }
      });

      scope[methodName].apply(scope, args);
    });
  }

  // Check if cache key is valid or not
  , validateCacheKey: function (key) {
    var oThis = this;
    return ((typeof key === 'string') && key !== '' && oThis._validateCacheValueSize(key, 250) === true && oThis._validateCacheKeyChars(key) === true) ? true : false;
  }

  // Check if cache value is valid or not
  , validateCacheValue: function (value) {
    var oThis = this;
    return (value !== undefined && oThis._validateCacheValueSize(value, 1024 * 1024) === true) ? true : false;
  }

  // Check if cache value is valid or not
  , validateCacheValueIsNotObject: function (value) {
    var oThis = this;
    return ((typeof value !== 'object') && value !== undefined && oThis._validateCacheValueSize(value, 1024 * 1024) === true) ? true : false;
  }

  // Check if cache value is valid or not
  , validateCacheValueIsObject: function (value) {
    var oThis = this;
    return ((typeof value === 'object') && value !== undefined && oThis._validateCacheValueSize(value, 1024 * 1024) === true) ? true : false;
  }

  // check if cache value size is < size
  , _validateCacheValueSize: function (value, size) {
    return Buffer.byteLength(value.toString(), 'utf8') > size ? false : true;
  }

  // check key has valid chars
  , _validateCacheKeyChars: function (key) {
    return /\s/.test(key) ? false : true;
  }

};

module.exports = helper;