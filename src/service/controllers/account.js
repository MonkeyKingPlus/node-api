/**
 * @swagger
 * tags:
 *   - name: Account
 *     description: 个人账户
 */

var express = require('express');
var router = express.Router();
var routerV2 = express.Router();

var util = require('util');

var Q = require('q');
var _ = require("underscore");

var libs = require("../../libs");
var helper = libs.common.helper;
var config = libs.common.config;
var accountBL = libs.business.account;
var requireAuth = libs.middleware.auth_service();

module.exports = function (app) {
    app.use('/v1/account', router);
};

/**
 * @swagger
 * /account/{id}:
 *   get:
 *     description: Get user info
 *     tags: [Account]
 *     parameters:
 *       - name: id
 *         description: UserId.
 *         in: path
 *         required: true
 *         type: integer
 *         format: int32
 *     responses:
 *       default:
 *         description: error model
 *         schema:
 *           type: object
 *           $ref: '#/definitions/ActionResult'
 *       200:
 *         description: comment query result
 *         schema:
 *           type: object
 *           allOf:
 *             - $ref: '#/definitions/User'
 */

/*V1版本,获取账户信息,可通过v1/account/id 或者 v2/account/id 来访问*/
router.get("/:id", requireAuth, function (req, res, next) {
    return Q().then(function () {
        return accountBL.getUserInfo(req.params.id);
    }).then(function (data) {
        res.send(helper.buildSuccessResult(data));
    }).catch(function (err) {
        next(err);
    })
});


/**
 * @swagger
 * /account/changeNickName:
 *   post:
 *     description: 修改昵称
 *     tags: [Account]
 *     parameters:
 *       - name: body
 *         description: 用户实体,只需要包含NickName.
 *         in: body
 *         required: true
 *         schema:
 *           type: object,
 *           $ref: '#/definitions/User'
 *     responses:
 *       default:
 *         description: error model
 *         schema:
 *           type: object
 *           $ref: '#/definitions/ActionResult'
 *       200:
 *         description: comment query result
 *         schema:
 *           type: integer
 */
router.post('/changeNickName', requireAuth, function (req, res, next) {
    var userId = req.user.ID;
    var nickName = req.body.NickName;
    accountBL.isNickNameExist(userId, nickName)
        .then(function (isExist) {
            console.log(isExist)
            if (isExist) {
                nickName = nickName + "_" + helper.getUuidWithoutHyphen().substring(0, 4);
            }
            return accountBL.updateNickName(userId, nickName)
                .then(function (affectRows) {
                    if (affectRows > 0) {
                        res.send(
                            isExist ?
                                helper.buildResult(config.mobile.returnCode.NickNameDuplicate, nickName, "您的昵称重复,系统已为您重命名,请及时修改") :
                                helper.buildSuccessResult()
                        );
                    } else {
                        res.send(helper.buildErrorResult());
                    }
                })
        })
        .catch(function (err) {
            next(err);
        })
});

/**
 * @swagger
 * /account/changeAvatar:
 *   post:
 *     description: 修改头像
 *     tags: [Account]
 *     parameters:
 *       - name: body
 *         description: 用户实体,只需要包含Avatar.
 *         in: body
 *         required: true
 *         schema:
 *           type: object,
 *           $ref: '#/definitions/User'
 *     responses:
 *       default:
 *         description: error model
 *         schema:
 *           type: object
 *           $ref: '#/definitions/ActionResult'
 *       200:
 *         description: comment query result
 *         schema:
 *           type: integer
 */
router.post('/changeAvatar', requireAuth, function (req, res, next) {
    accountBL.updateAvatar(req.user.ID, req.body.Avatar)
        .then(function (affectRows) {
            if (affectRows > 0) {
                res.send(helper.buildSuccessResult(affectRows));
            } else {
                res.send(helper.buildErrorResult());
            }
        })
        .catch(function (err) {
            next(err);
        })
});