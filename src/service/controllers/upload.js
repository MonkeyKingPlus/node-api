/**
 * @swagger
 * tags:
 *   - name: Upload
 *     description: 上传服务
 */

var fs = require('fs');
var path = require('path');

var uuid = require('node-uuid');
var express = require('express');
var router = express.Router();

var libs = require("../../libs");
var helper = libs.common.helper;
var config = libs.common.config;

var MAX_FILE_SIZE = 1024 * 1024 * 5;

module.exports = function (app) {
    app.use('/v1/upload', router);
};

/**
 * @swagger
 * /upload:
 *   post:
 *     description: 上传文件
 *     tags: [Upload]
 *     parameters:
 *       - name: body
 *         description: Upload model
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Upload'
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
 *           $ref: '#/definitions/ActionResult'
 */
router.post('/', function (req, res, next) {
    //var imageJpeg = fs.readFileSync("/Users/youkai/Downloads/22340206.jpeg");
    //var content = new Buffer(imageJpeg).toString('base64');
    //var fileName = "22340206.jpeg";

    var content = req.body.Content;
    var fileName = req.body.FileName;


    var saveFileName = uuid.v4() + path.extname(fileName);
    var buf = new Buffer(content, 'base64');
    if (buf.length <= 0 || buf.length > MAX_FILE_SIZE) {
        next(Error("最多只能上传5M的文件"));
    }

    fs.writeFileSync(path.resolve(__dirname, "../../uploads/" + saveFileName), buf, {encoding: 'utf8'});
    res.send(helper.buildSuccessResult(helper.buildImageUrl(saveFileName)));
});