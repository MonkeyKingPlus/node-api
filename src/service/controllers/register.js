var express = require('express');
var router = express.Router();

var libs = require("../../libs");
var helper = libs.common.helper;
var accountBL = libs.business.account;
var businessError = libs.common.businessError;

module.exports = function (app) {
    app.use('/v1/register', router);
};

router.post('/', function (req, res, next) {
    req.checkBody("Identifier", "用户名不能为空").notEmpty();
    var errors = req.validationErrors();
    if (errors && errors.length) {
        res.send(helper.buildErrorResult(4100, errors, helper.buildValidateErrorMessages(errors)));
    } else {
        return accountBL.getUserInfoByIdentifier(req.body.Identifier, req.body.IdentityType)
            .then(function (user) {
                if (user) {
                    throw new businessError("账号已注册,请直接登录");
                } else {
                    //todo:验证手机
                    var userInfo = req.body;
                    userInfo.IsThirdParty = 0;
                    return accountBL.createUser(userInfo)
                        .then(function (user) {
                            res.send(helper.buildSuccessResult(user));
                        })
                }
            })
            .catch(function (err) {
                next(err);
            })
    }
});