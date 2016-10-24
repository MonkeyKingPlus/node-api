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

router.get('/getAccessToken', function (req, res, next) {
    var code = req.getWeixinCode();
    if (!code) {
        res.send(helper.buildErrorResult("Invalid Code"));
    } else {
        weixin.getAccessToken(code)
            .then(function (token) {
                return weixin.getUserInfo(token.access_token, token.openid);
            })
            .then(function (userInfo) {

            })
    }
});

router.get("/getAuthUrl", function (req, res, next) {
    var url = weixin.getAuthUrlSync();
    res.json(helper.buildSuccessResult(url));
});

router.get("/authCallback", function (req, res, next) {
    console.log("========body=========")
    console.log(req.body)
    console.log("========query=========")
    console.log(req.query)
    res.json(helper.buildSuccessResult());
});