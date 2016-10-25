var config = require("./config");

var enums = {
    gender: {
        female: 1,
        male: 0,
        unknown: 2
    },
    passwordStrength: {
        weak: 0,
        normal: 1,
        strong: 2
    },
    securityLevel: {
        weak: 0,
        normal: 1,
        strong: 2
    }
};

enums.thirdPartyType = {};
enums.weixinType = {};

enums.identityType = {
    weixin: 0,
    weibo: 1,
    phone: 2,
    email: 3,
    qq: 4
};

enums.commonStatus = {
    invalid: 0,
    valid: 1,
    deleted: -999
};

enums.yn = {
    no: 0,
    yes: 1
}

module.exports = enums;
