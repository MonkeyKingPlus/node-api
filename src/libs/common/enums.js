var config = require("./config");

var enums = {};

/**
 * 认证类型
 * @type {{weixin: number, weibo: number, phone: number, email: number, qq: number}}
 */
enums.identityType = {
    weixin: 0,
    weibo: 1,
    phone: 2,
    email: 3,
    qq: 4
};

/**
 * 通用状态
 * @type {{invalid: number, valid: number, deleted: number}}
 */
enums.commonStatus = {
    invalid: 0,
    valid: 1,
    deleted: -999
};

/**
 * yes or no
 * @type {{no: number, yes: number}}
 */
enums.yn = {
    no: 0,
    yes: 1
};

/**
 * 性别
 * @type {{female: number, man: number}}
 */
enums.gender = {
    female: 1,
    man: 2
};

module.exports = enums;
