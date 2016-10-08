var util = require('util');
var os = require("os");

var Q = require("q");
var dateformat = require("dateformat");
var md5 = require("crypto-md5");

var settings = require("../common/config");
var cacheProvider = require("../common/cacheProvider")(settings.caches[settings.cache]);
var helper = require('../common/helper');
var logger = require('../common/logger')("authorize");
var blockloginTimes = 10; //10次失败lock
var loginTimesExpire = 300; //5分钟
var MESSAGE_TEMP_LOCK_ACCOUNT = "为了您的账户安全，您的账户已被临时锁定，请在5分钟后再尝试";
var accountBL = require('./account.js');

function getSessionUserData(user) {
    return {
        userId: user.UserID,
        authToken: issueUserAuthToken(user)
    };
}

function issueUserAuthToken(user) {
    if (!user) {
        return null;
    }

    var data = {
        ID: user.ID
    };

    var token = util.format("%s-%s", JSON.stringify(data), new Date().valueOf());

    return helper.encrypt(token);
}

function parseUserInfoAuthToken(token) {
    var result = null;

    try {
        var decryptToken = helper.decrypt(token);

        if (decryptToken.indexOf("-") !== -1) {
            result = JSON.parse(decryptToken.split("-")[0]);
        }
    } catch (err) {
    }

    return result;
}

function login(req, username, password) {
    //var ip = helper.getClientIp(req);

    return accountBL.login(username, password).fail(function (err) {
        throw err;
    });
}

function generateRememberMeCookie(loginName, identifier, token, authToken) {
    var cookieKey = loginName + ":" + identifier + ":" + token + ":" + authToken;
    return helper.encrypt(cookieKey);
}

function generateRememberMeCacheKey(loginName, identifier) {
    return util.format(settings.cacheKeys.rememberme_token, loginName, identifier);
}

function parseRememberMeCookie(c) {
    var cookie = null;

    try {
        cookie = helper.decrypt(c);
    }
    catch (err) {
        //noop
    }

    if (!cookie) {
        return null;
    }

    var arr = cookie.split(":");
    if (arr.length !== 4) {
        return null;
    }
    return {
        loginName: arr[0],
        identifier: arr[1],
        token: arr[2],
        authToken: arr[3]
    };
}

exports.authenticate = function () {
    return function (req, username, password, done) {
        return login(req, username, password)
            .then(function (user) {
                done(null, user);
            })
            .fail(function (err) {
                done(err, null, {message: err.message});
            });
    };
};

exports.serializeUser = function () {
    return function (user, done) {
        //put to session
        done(null, user);
    }
};

exports.deserializeUser = function () {
    return function (user, done) {
        //read from sesson
        done(null, user);
    }
};

exports.verifyAuthToken = function () {
    return function (token, done) {
        var userInfo = parseUserInfoAuthToken(token);
        if (!userInfo) {
            return done(null, false);
        }

        return accountBL.getUserInfo(userInfo.ID)
            .then(function (user) {
                if (!user) {
                    return done(null, false);
                }

                return done(null, getSessionUserData(user));
            })
            .fail(function (err) {
                return done(err);
            });
    };
};

exports.updateAuthToken = function () {
    return function (user, done) {
        var authToken = issueUserAuthToken(user);

        return done(null, authToken);
    };
};

exports.verifyRememberMeToken = function () {
    return function (token, done, req) {
        var cookie = parseRememberMeCookie(token);
        if (!cookie) {
            return done(null, false);
        }
        var cacheKey = generateRememberMeCacheKey(cookie.loginName, cookie.identifier);
        cacheProvider.get(cacheKey)
            .then(function (data) {
                if (!data) {
                    return done(null, false);
                }

                if (data.token !== cookie.token) {
                    cacheProvider.del(cacheKey);
                    return done(null, false);
                }

                return accountBL.getUserInfo(data.userId)
                    .then(function (user) {
                        if (!user) {
                            return done(null, false);
                        }

                        return done(null, getSessionUserData(user));
                    });
            }).fail(function (err) {
            return done(err);
        });
    };
};

exports.updateRememberMeToken = function () {
    return function (user, done) {
        var identifier = helper.randomStr(6);
        var token = helper.randomStr(6);
        var data = {
            userId: user.userId,
            token: token,
            generateTime: new Date(),
            type: 'update'
        };

        var remembermeCookie = generateRememberMeCookie(user.loginName, identifier, token, user.authToken);
        var cacheKey = generateRememberMeCacheKey(user.loginName, identifier);
        cacheProvider.set(cacheKey, data)
            .then(function () {
                return done(null, remembermeCookie);
            }).fail(function (err) {
            return done(err);
        });
    };
};

exports.logout = function (req, res, disableAutoRedirect) {
    var cookieKeys = settings.cookieKeys;

    res.clearMkpCookie(cookieKeys.authToken);

    req.logout();
    req.session.destroy();
};

exports.login = login;

exports.issueUserAuthToken = issueUserAuthToken;
exports.parseUserInfoAuthToken = parseUserInfoAuthToken;
exports.blockloginTimes = blockloginTimes;
exports.blockloginMessage = MESSAGE_TEMP_LOCK_ACCOUNT;
exports.getSessionUserData = getSessionUserData;
