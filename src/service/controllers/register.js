/**
 * @swagger
 * tags:
 *   - name: Register
 *     description: 注册
 */

var express = require('express');
var router = express.Router();

var libs = require("../../libs");
var helper = libs.common.helper;
var accountBL = libs.business.account;
var enums = libs.common.enums;
var businessError = libs.common.businessError;

module.exports = function (app) {
    app.use('/v1/register', router);
};

/**
 * @swagger
 * /register:
 *   post:
 *     description: Login to the application
 *     tags: [Register]
 *     parameters:
 *       - name: body
 *         description: User model
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           $ref: '#/definitions/User'
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
router.post('/', function (req, res, next) {
    req.checkBody("Identifier", "用户名不能为空").notEmpty();
    var identityType = req.body.IdentityType;
    if (identityType == enums.identityType.phone || identityType == enums.identityType.email) {
        req.checkBody("Credential", "密码不能为空").notEmpty();
    }
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