/**
 * @swagger
 * tags:
 *   - name: Index
 *     description: 基础配置
 */
var express = require('express');
var router = express.Router();

var libs = require("../../libs");
var helper = libs.common.helper;
var config = libs.common.config;

module.exports = function (app) {
    app.use('/v1', router);
};

router.get("/", function (req, res, next) {
    res.send("Hello express!");
});

/**
 * @swagger
 * /config:
 *   get:
 *     description: 获取基础配置
 *     tags: [Index]
 *     responses:
 *       default:
 *         description: code != 0
 *         schema:
 *           type: object
 *           $ref: '#/definitions/ActionResult'
 *       200:
 *         description: comment query result
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Config'
 */

router.get("/config", function (req, res, next) {
    res.send(helper.buildSuccessResult(config.mobile));
});