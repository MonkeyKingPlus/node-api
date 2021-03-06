/**
 * @swagger
 * tags:
 *   - name: Login
 *     description: 登录
 */
var fs = require("fs");
var path = require("path");
var http = require('http');

var express = require('express');
var loginRouter = express.Router();
var passport = require("passport");
var uuid = require("node-uuid");

var libs = require("../../libs");
var authorizeBL = libs.business.authorization;
var accountBL = libs.business.account;
var helper = libs.common.helper;
var enums = libs.common.enums;
var BusinessError = libs.common.businessError;
var restClient = libs.common.restClient;
var config = libs.common.config;

module.exports = function (app) {
    app.use('/v1/login', loginRouter);
};

/**
 * @swagger
 * /login:
 *   post:
 *     description: Login to the application
 *     tags: [Login]
 *     parameters:
 *       - name: body
 *         description: User login model
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           $ref: '#/definitions/LoginUser'
 *     responses:
 *       default:
 *         description: error model
 *         schema:
 *           type: object
 *           $ref: '#/definitions/ActionResult'
 *       200:
 *         description: user info
 *         schema:
 *           type: object
 *           $ref: '#/definitions/User'
 */
loginRouter.post("/", function (req, res, next) {
    req.checkBody("Identifier", "用户名不能为空").notEmpty();
    req.checkBody("Credential", "密码不能为空").notEmpty();

    var errors = req.validationErrors();
    if (errors && errors.length) {
        res.send(helper.buildErrorResult(4100, errors, helper.buildValidateErrorMessages(errors)));
    }
    else {
        passport.authenticate('local', {session: false}, function (err, user, info) {
            if (err || !user) {
                var message = "用户名或密码错误";
                if (err instanceof BusinessError) {
                    message = err.message;
                }
                res.send(helper.buildErrorResult(4101, null, message));
            }
            else {
                var token = authorizeBL.issueUserAuthToken(user);
                res.header("x-mkp-authentication", token);
                res.send(helper.buildSuccessResult(user, "登录成功"));
            }
        })(req, res, next);
    }
});

loginRouter.post("/weixin", function (req, res, next) {
        passport.authenticate('weixin', {session: false}, function (err, user, info) {
            if (err || !user) {
                var message = "微信授权失败";
                if (err instanceof BusinessError) {
                    message = err.message;
                }
                res.send(helper.buildErrorResult(4101, null, message));
            }
            else {
                var token = authorizeBL.issueUserAuthToken(user);
                res.header("x-mkp-authentication", token);
                res.send(helper.buildSuccessResult(user, "微信登录成功"));
            }
        })(req, res, next);
    }
);

/**
 * @swagger
 * /login/thirdparty:
 *   post:
 *     description: Login to the application with qq/weibo
 *     tags: [Login]
 *     parameters:
 *       - name: body
 *         description: User login model
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           $ref: '#/definitions/ThirdLoginUser'
 *     responses:
 *       default:
 *         description: error model
 *         schema:
 *           type: object
 *           $ref: '#/definitions/ActionResult'
 *       200:
 *         description: user info
 *         schema:
 *           type: object
 *           $ref: '#/definitions/User'
 */
loginRouter.post("/thirdparty", function (req, res, next) {
    req.checkBody("Identifier", "认证标识不能为空").notEmpty();
    req.checkBody("IdentityType", "认证类型不能为空").notEmpty();

    var errors = req.validationErrors();
    if (errors && errors.length) {
        res.send(helper.buildErrorResult(4100, errors, helper.buildValidateErrorMessages(errors)));
    }
    else {
        return loginForThirdPart(req.body)
            .then(function (user) {
                var token = authorizeBL.issueUserAuthToken(user);
                res.header("x-mkp-authentication", token);
                res.send(helper.buildSuccessResult(user, "登录成功"));
            })
            .catch(function (err) {
                next(err);
            })
    }
});

function loginForThirdPart(userInfo) {
    return accountBL.getUserInfoByIdentifier(userInfo.Identifier, userInfo.IdentityType)
        .then(function (user) {
            if (user) {
                return user;
            } else {
                var fileUrl = userInfo.Avatar;
                var fileName = helper.getUuidWithoutHyphen() + path.extname(fileUrl);
                if (fileUrl) {
                    http.get(fileUrl, function (response) {
                        response.pipe(fs.createWriteStream(path.resolve(config.app.uploadUrl, fileName)))
                    });
                }
                userInfo.Avatar = fileName;
                userInfo.IsThirdParty = enums.yn.yes;
                return accountBL.createUser(userInfo);
            }
        });
}
