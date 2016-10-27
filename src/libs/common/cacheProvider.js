var util = require("util");

var Q = require("q");
var memoryCache = require("memory-cache");

var config = require("./config.js");

/**
 * 缓存Provider,支持set,get和del,其中get返回的是promise,set和del无返回值
 * @param options
 * @constructor
 */
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
    memoryCache.put(key, value, this.options.timeout);
};
MemoryCacheStrategy.prototype.get = function (key) {
    return Q().then(function () {
        return memoryCache.get(key);
    });
};
MemoryCacheStrategy.prototype.del = function (key) {
    memoryCache.del(key);
};

function LevelUpStrategy(options) {
    CacheStrategy.call(this, options);
    this.levelup = require("./cacheDb/levelup")(options.path, options.leveloptions);
}

util.inherits(LevelUpStrategy, CacheStrategy);
LevelUpStrategy.prototype.set = function (key, value) {
    this.levelup.put(key, value);
};
LevelUpStrategy.prototype.get = function (key) {
    return this.levelup.get(key);
};
LevelUpStrategy.prototype.del = function (key) {
    this.levelup.del(key);
};

function getCacheStrategy(options) {
    switch (options.name) {
        case "memory-cache":
            return new MemoryCacheStrategy(options);
        case "levelup":
            return new LevelUpStrategy(options);
        default:
            return new MemoryCacheStrategy(options);
    }
}

module.exports = function (options) {
    return new CacheProvider(options);
};