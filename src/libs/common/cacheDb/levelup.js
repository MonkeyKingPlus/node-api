var levelup = require('level');
var Q = require('q');
var _ = require('underscore');

var dbs = [];
/**
 * levelup事例启动后会锁定LOCK文件,所以一个文件夹(等于一个DB)对应一个实例
 * @param dbPath
 * @param options
 * @returns {{put, get, del}|*}
 */
module.exports = function (dbPath, options) {
    dbPath = dbPath || 'default';
    var db = _.find(dbs, function (item) {
        return item.key == dbPath;
    });

    if (!db) {
        db = levelup(dbPath, options);
        dbs.push({
            key: dbPath,
            value: db
        });
    }

    function levelupInstance(newDb) {
        return {
            put: function (key, value) {
                newDb.put(key, value);
            },
            get: function (key) {
                var deferred = Q.defer();
                newDb.get(key, function (err, value) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(value);
                    }
                });
                return deferred.promise;
            },
            del: function (key) {
                newDb.del(key);
            }
        }
    }

    return levelupInstance(db);
}
