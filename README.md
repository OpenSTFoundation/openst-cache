OpenST Cache
============
[![Latest version](https://img.shields.io/npm/v/@openstfoundation/openst-cache.svg?maxAge=3600)][npm]
[![Travis](https://img.shields.io/travis/OpenSTFoundation/openst-cache.svg?maxAge=600)][travis]
[![Downloads per month](https://img.shields.io/npm/dm/@openstfoundation/openst-cache.svg?maxAge=3600)][npm]
[![Gitter](https://img.shields.io/gitter/room/OpenSTFoundation/github.js.svg?maxAge=3600)][gitter]

OpenST Cache is the central cache implementation for all OpenST products and can easily be plugged-in. 

It contains three caching engines. The decision of which caching engine to use is governed while creating the cache object. 
The caching engines implemented are:

* Memcached
* Redis
* In-process (use with single threaded process in development mode only)

##### Constructor parameters:
There is 1 parameter required while creating the cache implementer.

* First parameter is mandatory and it specifies the configuration strategy to be used. An example of the configStrategy is: 
```js
configStrategy = {
  cache: {
      engine: "none/redis/memcache"
  }
};
```

<b>Below are the examples:</b>
```js
// import the cache module
const OpenSTCache = require('@openstfoundation/openst-cache');
```
```js
// configStrategy for redis engine
configStrategy = {
  cache: {
    engine: "redis",
    host: "localhost",
    port: "6830",
    password: "dsdsdsd",
    enableTsl: "0",
    defaultTtl: 36000,
    consistentBehavior: "1"
  }
}
````

```js
// configStrategy for memcached engine
configStrategy = {
  cache: {
    engine: "memcached",
    servers: ["127.0.0.1:11211"],
    defaultTtl: 36000,
    consistentBehavior: "1"
  }
}
````
```js
// configStrategy for in-memory engine
configStrategy = {
  cache: {
    engine: "none",
    namespace: "A",
    defaultTtl: "36000",
    consistentBehavior: "1"
  }
}
````

# Install OpenST Cache

```bash
npm install @openstfoundation/openst-cache --save
```

# Examples:

#### Create OpenST Cache Object:

```js
OpenSTCache = require('@openstfoundation/openst-cache');
openSTCache = OpenSTCache.getInstance(configStrategy);

cacheImplementer = openSTCache.cacheInstance;
```

#### Store and retrieve data in cache using `set` and `get`:

```js
cacheImplementer.set('testKey', 'testValue', 5000).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
cacheImplementer.get('testKey').then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

#### Manage objects in cache using `setObject` and `getObject`:

```js
cacheImplementer.setObject('testObjKey', {dataK1: 'a', dataK2: 'b'}).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
cacheImplementer.getObject('testObjKey').then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

#### Retrieve multiple cache data using `multiGet`:

###### * <b>NOTE: Redis returns null from `multiGet` for objects, even if a value is set in the cache; the other caching engines match this behaviour.</b>

```js
cacheImplementer.set('testKeyOne', 'One').then(console.log);
cacheImplementer.set('testKeyTwo', 'Two').then(console.log);
cacheImplementer.multiGet(['testKeyOne', 'testKeyTwo']).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

#### Delete cache using `del`:

```js
cacheImplementer.set('testKey', 'testValue').then(console.log);
cacheImplementer.del('testKey').then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

#### Manage counters in cache using `increment` and `decrement`: 

```js
cacheImplementer.set('testCounterKey', 1).then(console.log);
cacheImplementer.increment('testCounterKey', 10).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
cacheImplementer.decrement('testCounterKey', 5).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

#### Change the cache expiry time using `touch`:

```js
cacheImplementer.set('testKey', "testData").then(console.log);
cacheImplementer.touch('testKey', 10).then(function(cacheResponse){
    if (cacheResponse.isSuccess()) {
      console.log(cacheResponse.data.response);
    } else {
      console.log(cacheResponse);
    }
  });
```

For further implementation details, please refer to the [API documentation][api-docs].

[gitter]: https://gitter.im/OpenSTFoundation/SimpleToken
[npm]: https://www.npmjs.com/package/@openstfoundation/openst-cache
[travis]: https://travis-ci.org/OpenSTFoundation/openst-cache
[api-docs]: https://openstfoundation.github.io/openst-cache/