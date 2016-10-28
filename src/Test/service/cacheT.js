var util = require("util");

var assert = require('assert');

//var libs = require("../../libs");
var config = require("../../libs/common/config");
var cacheProvider = require("../../libs/common/cacheProvider");

var leveldbConfig = {
    "name": "levelup",
    "path": "../caches/leveldbtest",
    "leveloptions": {
        "cacheSize": 8 * 1024 * 1024,
        "keyEncoding": 'utf8'
    }
};
var levelup = cacheProvider(leveldbConfig);
var memoCache = cacheProvider(config.caches.memory);

var testStrKey = "t_str";
var testStr = "This is a test string";

var testObjectKey = "t_object";
var testObject = {
    value: "This is a test string"
};

describe('Cache-LevelUp', function () {
    describe('#str-set()', function () {
        it('error', function () {
            levelup.set(testStrKey, testStr);
        });
    });
    describe('#str-get()', function () {
        it(util.format('should return a string as "%s" ', testStr), function () {
            levelup.get(testStrKey).then(function (result) {
                assert.equal(testStr, result);
            })
        });
    });
    describe('#str-del()', function () {
        levelup.del(testStrKey);
        it(util.format('should return a string as "undefined" ', testStr), function () {
            levelup.get(testStrKey).then(function (result) {
                assert.equal(undefined, result);
            })
        });
    });

    describe('#object-set()', function () {
        it('error', function () {
            levelup.set(testObjectKey, testObject);
        });
    });
    describe('#object-get()', function () {
        it(util.format('should return a string as "%s" ', testObject.value), function () {
            levelup.get(testObjectKey).then(function (result) {
                assert.equal(testObject.value, result.value);
            })
        });
    });
    describe('#object-del()', function () {
        levelup.del(testObjectKey);
        it(util.format('should return a string as "%s" ', testObject.value), function () {
            levelup.get(testObjectKey).then(function (result) {
                assert.equal(testObject.value, result.value);
            })
        });
    });
});


describe('Cache-Memory', function () {
    describe('#str-set()', function () {
        it('error', function () {
            memoCache.set(testStrKey, testStr);
        });
    });
    describe('#str-get()', function () {
        it(util.format('should return a string as "%s" ', testStr), function () {
            memoCache.get(testStrKey).then(function (result) {
                assert.equal(testStr, result);
            })
        });
    });
    describe('#str-del()', function () {
        memoCache.del(testStrKey);
        it(util.format('should return a string as "undefined" ', testStr), function () {
            memoCache.get(testStrKey).then(function (result) {
                assert.equal(undefined, result);
            })
        });
    });

    describe('#object-set()', function () {
        it('error', function () {
            memoCache.set(testObjectKey, testObject);
        });
    });
    describe('#object-get()', function () {
        it(util.format('should return a string as "%s" ', testObject.value), function () {
            memoCache.get(testObjectKey).then(function (result) {
                assert.equal(testObject.value, result.value);
            })
        });
    });
    describe('#object-del()', function () {
        memoCache.del(testObjectKey);
        it(util.format('should return a string as "%s" ', testObject.value), function () {
            memoCache.get(testObjectKey).then(function (result) {
                assert.equal(testObject.value, result.value);
            })
        });
    });
});