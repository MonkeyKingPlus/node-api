var dateformat = require("dateformat");
var md5 = require("crypto-md5");
var uuid = require("node-uuid");

var accountDb = require('../db_conf/db_account.js');
var db = require('../common/db_mysql_q.js')();
var businessError = require('../common/businesserror');
var helper = require('../common/helper');
var logger = require('../common/logger')("service");
var enums = require('../common/enums');

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
    return db.executeSqlOne(accountDb.getUserInfo, [id])
        .then(function (user) {
            return formatUserInfo(user);
        });
}

exports.bindThirdPartUser = function () {

}

exports.getUserInfoByIdentifier = function (identifier, identityType) {
    return db.executeSqlOne(accountDb.getUserInfoByIdentifier, [identifier, identityType])
        .then(function (user) {
            return formatUserInfo(user);
        });
}

/**
 * 创建用户
 * @param userInfo {object} 用户信息
 */
exports.createUser = function (userInfo) {
    return db.executeTranPromise(accountDb.createUser.db,
        function (trans) {
            userInfo.Status = enums.commonStatus.valid;
            return db.executeTran(trans, accountDb.createUser, userInfo)
                .then(function (result) {
                    userInfo.ID = userInfo.UserInfoID = result.insertId;
                    if (userInfo.IsThirdParty) {
                        userInfo.Credential = uuid.v4();
                    }
                    userInfo.Credential = formatPassword(userInfo.Credential);
                    return db.executeTran(trans, accountDb.bindUserAuth, userInfo);
                })
        }
    ).then(function () {
        return exports.getUserInfo(userInfo.ID);
    }).fail(function (err) {
        logger.error(err);
        throw new businessError("用户创建不成功")
    });
};

/**
 * 更新用户昵称
 * @param userId
 * @param nickName
 * @returns {int} 影响记录数
 */
exports.updateNickName = function (userId, nickName) {
    return db.executeSql(accountDb.updateNickName, {
            ID: userId,
            NickName: nickName
        })
        .then(function (result) {
            return result.changedRows;
        });
};

/**
 * 更新用户头像
 * @param userId
 * @param nickName
 * @returns {int} 影响记录数
 */
exports.updateAvatar = function (userId, avatarName) {
    return db.executeSql(accountDb.updateAvatar, {
        ID: userId,
        Avatar: avatarName
    }).then(function (result) {
        return result.changedRows;
    })
};

exports.isNickNameExist = function (userId, nickName) {
    return db.executeSqlOne(accountDb.isNickNameExist, {ID: userId, NickName: nickName})
        .then(function (result) {
            return !!result.NickName;
        })
};

function formatUserInfo(user) {
    if (user) {
        user.Avatar = helper.buildImageUrl(user.Avatar);
    }

    return user;
}