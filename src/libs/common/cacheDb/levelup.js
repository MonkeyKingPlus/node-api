var levelup = require('level');
var Q = require('q');

module.exports = function (dbPath, options) {
    var db = levelup(dbPath || './mydb', options);
    return {
        put: function (key, value) {
            db.put(key, value);
        },
        get: function (key) {
            var deferred = Q.defer();
            db.get(key, function (err, value) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(value);
                }
            });
            return deferred.promise;
        },
        del: function (key) {
            db.del(key);
        }
    }
}
