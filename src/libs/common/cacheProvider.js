var util = require("util");

var Q = require("q");
var config = require("./config.js");

/**
 * 缓存Provider,支持set,get和del,其中get返回的是promise,set和del无返回值
 * @param options 默认为config.currentCache,也可以选择所需要的config.caches.memory/config.caches.levelup and so on.
 * @constructor
 */
function CacheProvider(options) {
    if (!options) {
        options = config.caches[config.currentCache];
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

function CacheStrategy(instance) {
    if (!instance) {
        throw new Error("instance can't be null");
    }
    this.instance = instance;
}
CacheStrategy.prototype.set = function (key, value, expired_time) {
    this.instance.put(key, value, expired_time);
};
CacheStrategy.prototype.get = function (key) {
    var self = this;
    return Q().then(function () {
        return self.instance.get(key);
    });
};
CacheStrategy.prototype.del = function (key) {
    this.instance.del(key);
};


function MemoryCacheStrategy(options) {
    CacheStrategy.call(this, require("memory-cache"));
}
util.inherits(MemoryCacheStrategy, CacheStrategy);

function LevelUpStrategy(options) {
    CacheStrategy.call(this, require("./cacheDb/levelup")(options.path, options.leveluptions));
}
util.inherits(LevelUpStrategy, CacheStrategy);

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