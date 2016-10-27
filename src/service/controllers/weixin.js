var express = require('express');
var router = express.Router();

var libs = require("../../libs");
var weixin = libs.common.weixin();
var helper = libs.common.helper;

module.exports = function (app) {
    app.use("/v1/weixin", router);
};

router.get("/verify", function (req, res, next) {
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;

    if (weixin.verifyInterface(timestamp, nonce, signature)) {
        res.send(echostr);
    } else {
        res.send(helper.buildErrorResult());
    }
});