var Q = require('q');
var request = require('request');
var util = require("util");
var http = require('http');

var config = require("../common/config").sotaoRestServiceConfig;

http.globalAgent.maxSockets = 30;

var RestClient = function (options) {
};

var isWeixin = function (req) {
    var ua = req.headers["user-agent"];
    return (/micromessenger/gi).test(ua);
};


function isWeixin(req) {
    var ua = req.headers["user-agent"];
    return (/micromessenger/gi).test(ua);
};


RestClient.prototype.get = function (url, options) {
    var options = options || {};
    options.url = url;
    //options.json = true;
    options.proxy = false;

    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';

    var deferred = Q.defer();

    request(options, function (err, response, body) {
        if (!err) {
            if (response.headers["content-type"]
                && response.headers["content-type"].indexOf('application/json') >= 0) {
                response.content = JSON.parse(body);
            } else {
                response.content = body;
            }
            //response.content = body;
            deferred.resolve(response);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
};

RestClient.prototype.post = function (url, data, options) {
    if (!options) options = {};
    options.url = url;
    options.json = data;
  //  options.proxy =  regexIsInternalAddress.test(url) ? false : process.env.http_proxy;
    options.proxy = false;

    var deferred = Q.defer();

    request.post(options, function optionalCallback(err, response, body) {
        if (!err) {
            response.content = body;
            deferred.resolve(response);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;

};


RestClient.prototype.postText = function(url, data, options) {
    var deferred = Q.defer();
    request.post({url:url,
        body : data,
        headers: {'Content-Type': 'text/plain'},
        proxy : false
}, function optionalCallback(err, response, body) {
        if (!err) {
            response.content = body;
            deferred.resolve(response);
        }else{
            deferred.reject(err);
        }
    });
    return deferred.promise;

};


RestClient.prototype.put = function (url, data, options) {
    if (!options) options = {};
    options.url = url;
    options.json = data;
  //  options.proxy =  regexIsInternalAddress.test(url) ? false : process.env.http_proxy;
    options.proxy = false;

    var deferred = Q.defer();
    request.put(options, function optionalCallback(err, response, body) {
        if (!err) {
            response.content = body;
            deferred.resolve(response);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
};

RestClient.prototype.delete = function (url, options) {
    if (!options) options = {};
    options.url = url;
    options.json = true;
    //options.proxy =  regexIsInternalAddress.test(url) ? false : process.env.http_proxy;
    options.proxy = false;

    var deferred = Q.defer();
    request.del(options, function optionalCallback(err, response, body) {
        if (!err) {
            response.content = body;
            deferred.resolve(response);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
};

RestClient.prototype._generateHeadersFromRequest = function(req){
    var authToken = null;

    if(req.user){
        authToken = req.user.authToken;
    }

    // cookie里的at可能来自两个地方，mobile app访问wap页面带过来或者最初版本的微信看房生成
    // 微信看房现在已经废弃了生成at的做法，所以在微信里不用再从cookie里去取token
    if(req.cookies["at"] && !isWeixin(req)){
        authToken = req.cookies["at"];
    }

    headers = {
        "x-sitecode": req.siteCode || 10000,
        "x-deviceid": req.deviceId,
        "x-user-agent": req.headers["x-user-agent"] || req.headers["user-agent"],
        "x-sotao-authentication": authToken,
        "user-agent": req.headers["user-agent"]
    };

    if(req.weixin_type){
        headers.weixin_type = req.weixin_type;
    }

    return headers;
};

exports = module.exports = function (options) {
    var client = new RestClient(options);

    function generateMethod(objectToAttachMethod, methodName, methodConfig){
        objectToAttachMethod[methodName] = (function (conf) {

            //第一个参数必须是req
            //后面的参数没有顺序要求
            //Object  是post数据或者是query数据
            //Array  是url path 参数
            return function () {
                var url = conf.url;
                var type = conf.type;
                // console.log("arguments:",arguments);
                //console.log("conf:",conf);
                //resolve url
                //console.log("scope:",this);
                var i = 1, len = arguments.length;
                var data;

                var req = arguments[0];
                if (!req.headers) {
                    throw "第一个参数必须是req";
                }
                
                var options = {
                    headers : this._generateHeadersFromRequest(req)
                };

                for (; i < len; i++) {
                    if (arguments[i] instanceof Array) {
                        url = util.format.apply(null, [url].concat(arguments[i]));
                    }
                    else if (arguments[i] instanceof Object) {
                        data = arguments[i];
                    }
                }
                url = url.replace(/%s/g, "");

                //console.log("resolved:",conf);

                if (/^post$/i.test(type)) {
                    //console.log("REST CLIENT [%s] %s",type,url);
                    return this.post(url, data, options);
                }
                else if (/^get$/i.test(type)) {
                    if (data) {
                        var str = [];
                        for (var p in data) {
                            str.push(p + "=" + data[p]);
                        }
                        var index = conf.url.indexOf("?");
                        if (index > 0) {
                            url += "&" + str.join("&");
                        }
                        else {
                            url += "?" + str.join("&");
                        }
                    }
                    //console.log("REST CLIENT [%s] %s",type,url);
                    return this.get(url, options);
                }
                else {
                    throw "not resolve type " + conf.type;
                }
            }.bind(client);
        })(methodConfig);
    }

    function discoverServiceConfig(objectToAttachMethod, config){
        for(var key in config){
            if(typeof config[key].url === "string"){
                generateMethod(objectToAttachMethod, key, config[key]);
            }
            else{
                var newObjectToAttachMethod = {};
                objectToAttachMethod[key] = newObjectToAttachMethod;
                discoverServiceConfig(newObjectToAttachMethod, config[key]);
            }
        }
    }

    discoverServiceConfig(client, config);

    return client;
};

