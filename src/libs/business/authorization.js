var util = require('util');

var Q = require("q");
var dateformat = require("dateformat");
var md5 = require("crypto-md5");
var _ = require('underscore');

var settings = require("../common/config");
var cacheProvider = require("../common/cacheProvider")();
var helper = require('../common/helper');
var businessError = require('../common/businesserror');
var enums = require('../common/enums');
var logger = require('../common/logger')("authorize");
var blockloginTimes = 10; //10次失败lock
var loginTimesExpire = 300; //5分钟
var MESSAGE_TEMP_LOCK_ACCOUNT = "为了您的账户安全，您的账户已被临时锁定，请在5分钟后再尝试";
var accountBL = require('./account.js');
var weixin = require('../common/weixin');

function getSessionUserData(user) {
    return _.extend(user, {authToken: issueUserAuthToken(user)})
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

/**
 * @description 获取或者创建微信用户
 * @param {object} req 网络请求
 * @return {object} 系统用户信息
 * @author steve
 * @static
 */
function ensureWeiXinUserInfo(req) {
    var code = req.getWeixinCode();
    // 根据code获取access_token和openid;
    // 根据openid获取用户信息,如果存在,直接返回;
    // 根据openid和access_token,获取微信用户信息;如果存在,则返回,否则创建并绑定用户后再返回
    weixin.getAccessToken(code)
        .then(function (token) {
            if (token.errcode) {
                throw new businessError(token.errmsg);
            } else {
                //TODO:加上缓存后,讲token写入缓存,可以使用code或者openid从缓存中拉数据
                return accountBL.getUserInfoByIdentifier(token.openid, enums.identityType.weixin)
                    .then(function (user) {
                        if (user && user.UserID > 0) {
                            return user;
                        } else {
                            return weixin.getUserInfo(token.access_token, token.openid);
                        }
                    })
            }
        })
        .then(function (weixinUser) {
            /* weixinUser
             {
             "openid":"OPENID",
             "nickname":"NICKNAME",
             "sex":1,
             "province":"PROVINCE",
             "city":"CITY",
             "country":"COUNTRY",
             "headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",
             "privilege":[
             "PRIVILEGE1",
             "PRIVILEGE2"
             ],
             "unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL"

             }
             */
            if (token.errcode) {
                throw new businessError(token.errmsg);
            }
            var userInfo = {
                Identifier: weixinUser.openid,
                NickName: weixinUser.nickname,
                Avatar: weixinUser.headimgurl,//TODO:将头像上传到自己的图片服务器,以免微信换头像后本地用户头像就找不到了
                UnionId: weixinUser.unionid, //微信用户唯一ID,此字段可在多个APP之间共享用户信息
                IdentityType: enums.identityType.weixin,
                Status: enums.commonStatus.valid
            };
            return accountBL.createUser(userInfo);
        });
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

/**
 * @description 对微信用户进行授权
 * @returns {Function}
 */
exports.authenticateWeiXin = function () {
    return function (req, done) {
        return ensureWeiXinUserInfo(req)
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

        Q().then(function () {
            return cacheProvider.get(cacheKey);
        }).then(function (data) {
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
        Q().then(function () {
            cacheProvider.set(cacheKey, data);
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
