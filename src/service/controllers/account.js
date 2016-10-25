/**
 * @swagger
 * tags:
 *   - name: Account
 *     description: account services
 */

var express = require('express');
var router = express.Router();
var routerV2 = express.Router();

var util = require('util');

var Q = require('q');
var _ = require("underscore");

var libs = require("../../libs");
var helper = libs.common.helper;
var accountBL = libs.business.account;
var authorizationBL = libs.business.authorization;
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
 */

/*V1版本,获取账户信息,可通过v1/account/id 或者 v2/account/id 来访问*/
router.get("/:id", requireAuth, function (req, res, next) {
    return Q().then(function () {
        return accountBL.getUserInfo(req.user.ID);
    }).then(function (data) {
        res.send(helper.buildSuccessResult(data));
    }).catch(function (err) {
        next(err);
    })
});