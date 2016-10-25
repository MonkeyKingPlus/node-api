/**
 * @swagger
 * tags:
 *   - name: Comment
 *     description: 评论相关接口
 */

var express = require('express');
var router = express.Router();

var libs = require("../../libs");
var requireAuth = libs.middleware.auth_service();

module.exports = function (app) {
    app.use("/v1/comment", router);
};

/**
 * @swagger
 * /comment:
 *   post:
 *     description: 发表评论
 *     tags: [Comment]
 *     parameters:
 *       - name: body
 *         description: comment model
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Comment'
 *     responses:
 *       default:
 *         description: error model
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Error'
 *       200:
 *         description: comment model
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Comment'
 */
router.post("/", requireAuth, function (req, res, next) {

});