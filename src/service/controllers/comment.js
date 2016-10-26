/**
 * @swagger
 * tags:
 *   - name: Comment
 *     description: 评论
 */

var express = require('express');
var router = express.Router();

var libs = require("../../libs");
var helper = libs.common.helper;
var commentBL = libs.business.comment;
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
 *         description: comment query result
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Comment'
 */
router.post("/", requireAuth, function (req, res, next) {
    var userInfo = req.body;
    userInfo.CommentUserInfoID = req.user.ID;
    return commentBL.saveComment(userInfo)
        .then(function (result) {
            res.send(helper.buildSuccessResult(result));
        })
        .catch(function (err) {
            next(err);
        })

});

/**
 * @swagger
 * /comment/{articleid}:
 *   get:
 *     description: 获取文章的评论列表
 *     tags: [Comment]
 *     parameters:
 *       - name: articleid
 *         description: 文章id
 *         in: path
 *         required: true
 *         type: integer
 *       - name: pagesize
 *         description: 每页记录数
 *         in: query
 *         required: true
 *         type: integer
 *       - name: pageindex
 *         description: 页码
 *         in: query
 *         required: true
 *         type: integer
 *     responses:
 *       default:
 *         description: error model
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Error'
 *       200:
 *         description: comment query result
 *         schema:
 *           type: object
 *           $ref: '#/definitions/CommentQueryResult'
 */
router.get('/:articleid', function (req, res, next) {
    commentBL.queryCommentList(req.body.articleid, req.query.pagesize, req.query.pageindex)
        .then(function (result) {
            res.send(helper.buildSuccessResult(result));
        })
        .catch(function (err) {
            next(err);
        })

});