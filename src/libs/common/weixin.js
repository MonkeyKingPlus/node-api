var util = require('util');

var sha1 = require('node-sha1');

var restClient = require("./rest_client")();
var appConfig = require("../common/config");


var token = "qwe123QWEasdASD";

module.exports = function (config) {
    var config = config || appConfig.weixin;

    var API = {
        ticket: "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi",
        sendMessage: "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=%s",
        verifyAuthToken: "https://api.weixin.qq.com/sns/auth?access_token=%s&openid=%s",
        //snsapi_base 不需要手动授权 , snsapi_userinfo 需要用户手动授权
        authorize: "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + config.appID + "&redirect_uri=%s&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect",
        authorize_base: "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + config.appID + "&redirect_uri=%s&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect",
        normalToken: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
        authToken: "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + config.appID + "&secret=" + config.appsecret + "&code=%s&grant_type=authorization_code",
        user: "https://api.weixin.qq.com/cgi-bin/user/info?access_token=%s&openid=%s&lang=zh_CN",
        create_qrcode: "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=%s",
        //发送模板消息 API TOKEN
        sendTempMessage: "https://api.weixin.qq.com/cgi-bin/template/api_set_industry?access_token=%s",
        //获得模板的ID API TOKEN
        getTempId: "https://api.weixin.qq.com/cgi-bin/template/api_add_template?access_token=%s"
    };

    return {
        /**
         * @description 验证微信接口
         * @param {String} timestamp
         * @param {String} nonce
         * @param {String} signature
         * @returns {boolean}
         */
        verifyInterface: function (timestamp, nonce, signature) {
            var array = [timestamp, nonce, token];
            var tempStr = array.sort().join('');
            var sha1Str = sha1(tempStr);
            if (sha1Str == signature) {
                return true;
            }
            return false;
        },
        getNormalAccessToken: function () {
            var tokenUrl = util.format(API.normalToken, config.appID, config.appsecret);

            return restClient.get(tokenUrl)
                .then(function (response) {
                    var result = JSON.parse(response.body);
                    return result;
                });
        },
        getAuthUrlSync: function (url) {
            var tokenUrl = util.format(API.authorize_base, encodeURIComponent(url || config.redirectUri));
            return tokenUrl;
        },
        getAccessToken: function (code) {
            var url = util.format(API.authToken, code);

            return restClient.post(url)
                .then(function (response) {
                    logger.info("call weixin api success", response.body);
                    var result = JSON.parse(response.body);

                    return result;
                })
                .fail(function (err) {
                    logger.info("call weixin api fail", err);

                    throw err;
                });
        },
        verifyAuthToken: function (openid, access_token) {
            return restClient.get(util.format(API.verifyAuthToken, access_token, openid))
                .then(function (response) {
                    var result = JSON.parse(response.body);

                    return result.errcode === 0;
                });
        },
        getUserInfo: function (access_token, openid) {
            return restClient.get(util.format(API.user, access_token, openid))
                .then(function (response) {
                    return JSON.parse(response.body);
                })
                .fail(function (err) {
                    logger.error("get weixin user info failed, url:", util.format(API.user, access_token, openid));
                    logger.error(err);
                });
        }
    }
};