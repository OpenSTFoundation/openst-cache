const rootPrefix = ".."
  , cacheConfig = require(rootPrefix + '/config/cache');

console.log("DEFAULT_TTL: " + cacheConfig.DEFAULT_TTL);
console.log("CACHING_ENGINE: " + cacheConfig.CACHING_ENGINE);
console.log("REDIS_HOST: " + cacheConfig.REDIS_HOST);
console.log("REDIS_PORT: " + cacheConfig.REDIS_PORT);
console.log("REDIS_PASS: " + cacheConfig.REDIS_PASS);
console.log("REDIS_TLS_ENABLED: " + cacheConfig.REDIS_TLS_ENABLED);
console.log("MEMCACHE_SERVERS: " + cacheConfig._MEMCACHE_SERVERS);