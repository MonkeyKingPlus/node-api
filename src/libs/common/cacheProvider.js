var util = require("util");

var Q = require("q");
var memoryCache = require("memory-cache");

var config = require("./config.js");

function CacheProvider(options) {
    if (!options) {
        options = config.caches.memory
    }
    this.strategy = getCacheStrategy(options);
}

CacheProvider.prototype.set = function (key, value) {
    return this.strategy.set(key, value);
};

CacheProvider.prototype.get = function (key) {
    return this.strategy.get(key);
};

CacheProvider.prototype.del = function (key) {
    return this.strategy.del(key);
};

function CacheStrategy(options) {
    this.options = options;
}
CacheStrategy.prototype.set = function (key, value) {
    throw new Error("method 'set' is not implemented");
};

CacheStrategy.prototype.get = function (key) {
    throw new Error("method 'get' is not implemented");
};

CacheStrategy.prototype.del = function (key) {
    throw new Error("method 'del' is not implemented");
};

function MemoryCacheStrategy(options) {
    CacheStrategy.call(this, options);
}

util.inherits(MemoryCacheStrategy, CacheStrategy);
MemoryCacheStrategy.prototype.set = function (key, value) {
    return Q().then(function(){
        return memoryCache.put(key, value, this.options.timeout);
    });
};
MemoryCacheStrategy.prototype.get = function (key) {
    return Q().then(function(){
        return memoryCache.get(key);
    });
};
MemoryCacheStrategy.prototype.del = function (key) {
    return Q().then(function() {
        memoryCache.del(key);
    });
};

function getCacheStrategy(options) {
    switch (options.name) {
        case "memory-cache":
            return new MemoryCacheStrategy(options);
        default:
            return new MemoryCacheStrategy(options);
    }
}

module.exports = CacheProvider;