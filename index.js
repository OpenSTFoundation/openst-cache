/**
 * Index File for openst-cache
 */

'use strict';

const rootPrefix = '.',
  version = require(rootPrefix + '/package.json').version,
  OpenSTCacheKeys = require(rootPrefix + '/services/openst_cache_keys'),
  OSTBase = require('@openstfoundation/openst-base'),
  coreConstants = require(rootPrefix + '/config/coreConstants');

const InstanceComposer = OSTBase.InstanceComposer;

require(rootPrefix + '/services/cache_instance');

const OpenSTCache = function(configStrategy) {
  const oThis = this;

  if (!configStrategy) {
    throw 'Mandatory argument configStrategy missing';
  }

  const instanceComposer = new InstanceComposer(configStrategy);
  oThis.ic = function() {
    return instanceComposer;
  };
};

OpenSTCache.prototype = {
  version: version,
  OpenSTCacheKeys: OpenSTCacheKeys
};

Object.defineProperty(OpenSTCache.prototype, 'cacheInstance', {
  get: function() {
    const oThis = this;
    return oThis.ic().getInstanceFor(coreConstants.icNameSpace, 'getCacheInstance');
  }
});

const instanceMap = {};

/**
 * Creates the key for the instanceMap.
 *
 * @returns {string}
 *
 */
const getInstanceKey = function(configStrategy) {
  if (!configStrategy.hasOwnProperty('cache') || !configStrategy.cache.hasOwnProperty('engine')) {
    throw 'CACHING_ENGINE parameter is missing.';
  }
  if (configStrategy.cache.engine === undefined) {
    throw 'CACHING_ENGINE parameter is empty.';
  }

  // Grab the required details from the configStrategy.
  const cacheEngine = configStrategy.cache.engine.toString();
  let isConsistentBehaviour = configStrategy.cache.consistentBehavior;

  // Sanitize isConsistentBehaviour
  isConsistentBehaviour = isConsistentBehaviour === undefined ? true : isConsistentBehaviour != '0';

  // Stores the endpoint for key generation of instanceMap.
  let endpointDetails = null;

  // Generate endpointDetails for key generation of instanceMap.
  if (cacheEngine == 'redis') {
    const redisMandatoryParams = ['host', 'port', 'password', 'enableTsl'];

    // Check if all the mandatory connection parameters for Redis are available or not.
    for (let i = 0; i < redisMandatoryParams.length; i++) {
      if (!configStrategy.cache.hasOwnProperty(redisMandatoryParams[i])) {
        throw 'Redis - mandatory connection parameters missing.';
      }
      if (configStrategy.cache[redisMandatoryParams[i]] === undefined) {
        throw 'Redis - connection parameters are empty.';
      }
    }

    endpointDetails =
      configStrategy.cache.host.toLowerCase() +
      '-' +
      configStrategy.cache.port.toString() +
      '-' +
      configStrategy.cache.enableTsl.toString();
  } else if (cacheEngine == 'memcached') {
    if (!configStrategy.cache.hasOwnProperty('servers')) {
      throw 'Memcached - mandatory connection parameters missing.';
    }
    if (configStrategy.cache.servers === undefined) {
      throw 'MEMCACHE_SERVERS(configStrategy.cache.servers) parameter is empty. ';
    }
    endpointDetails = configStrategy.cache.servers.join(',').toLowerCase();
  } else {
    endpointDetails = configStrategy.cache.namespace || '';
  }

  return cacheEngine + '-' + isConsistentBehaviour.toString() + '-' + endpointDetails;
};

let Factory = function() {};

Factory.prototype = {
  /**
   * Fetches a cache instance if available in instanceMap. If instance is not available in
   * instanceMap, it calls createCacheInstance() to create a new cache instance.
   *
   * @returns {cacheInstance}
   *
   */
  getInstance: function(configStrategy) {
    let instanceKey = getInstanceKey(configStrategy);

    let _instance = instanceMap[instanceKey];

    if (!_instance) {
      _instance = new OpenSTCache(configStrategy);
      instanceMap[instanceKey] = _instance;
    }

    return _instance;
  }
};

const factory = new Factory();
OpenSTCache.getInstance = function() {
  return factory.getInstance.apply(factory, arguments);
};

module.exports = OpenSTCache;
