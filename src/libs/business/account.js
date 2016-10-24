var dateformat = require("dateformat");
var md5 = require("crypto-md5");
var uuid = require("node-uuid");

var accountDb = require('../db_conf/db_account.js');
var db = require('../common/db_mysql_q.js')();
var businessError = require('../common/businesserror');
var logger = require('../common/logger')("service");

function formatPassword(password, time) {
    if (!password) {
        return "";
    }
    var md5Hex = function (str) {
        return md5(str, "hex");
    };

    var dateformatTmpl = "yyyy/m/d H:MM:ss";
    //前台会对密码做一次md5处理，后台在这个基础上做两次md5，再加上时间戳做一次md5
    return md5Hex(md5Hex(md5Hex(password)) + dateformat(time, dateformatTmpl)).toUpperCase();
}

exports.login = function (loginName, password) {
    password = formatPassword(password);
    return db.executeSqlOne(accountDb.login, [loginName, password]);
}

exports.getUserInfo = function (id) {
    return db.executeSqlOne(accountDb.getUserInfo, [id]);
}

exports.bindThirdPartUser = function () {

}

exports.getUserInfoByIdentifier = function (identifier, identityType) {
    return db.executeSqlOne(accountDb.getUserInfoByIdentifier, [identifier, identityType]);
}

/**
 * 创建用户
 * @param userInfo {object} 用户信息
 */
exports.createUser = function (userInfo) {
    return db.executeTranPromise(accountDb.insertTest.db,
        function (trans) {
            return db.executeTran(trans, accountDb.createUser, userInfo)
                .then(function (result) {
                    userInfo.UserInfoID = result.insertId;
                    if (userInfo.IsThirdParty) {
                        userInfo.Credential = uuid.v4();
                    }
                    userInfo.Credential = formatPassword(userInfo.Credential);
                    return db.executeTran(trans, accountDb.bindUserAuth, userInfo);
                })
                .then(function () {
                    return userInfo;
                });
        }
    ).fail(function (err) {
        logger.error(err);
        throw new businessError("用户创建不成功")
    });
}