var Q = require("q");
var crypto = require('crypto');
var dateformat = require("dateformat");
var util = require('util');
var os = require("os");
var config = require('./config');
var fs = require("fs");
var path = require("path");
var _ = require('lodash');
var urlUtil = require('url');
var uuid = require('node-uuid');
var enums = require("./enums");
var idCardValidator = require('./idcard-validator');
var mime = require("mime");

_.extend(exports, enums);

exports.promiseLimit = function (values, max, iterator) {
    max = max - 1;
    var deferred = Q.defer();
    var list = _.clone(values).reverse();
    var outstanding = 0;

    function catchingFunction(value) {
        deferred.notify(value);
        outstanding--;
        if (list.length) {
            outstanding++;
            iterator(list.pop())
                .then(catchingFunction)
                .fail(rejectFunction);
        }
        else if (outstanding === 0) {
            deferred.resolve();
        }
    }

    function rejectFunction(err) {
        deferred.reject(err);
    }

    while (max-- && list.length) {
        iterator(list.pop())
            .then(catchingFunction)
            .fail(rejectFunction);
        outstanding++;
    }

    return deferred.promise;
};

exports.promiseWhile = function (condition, body) {
    var done = Q.defer();

    function loop() {
        // When the result of calling `condition` is no longer true, we are
        // done.
        if (!condition()) return done.resolve();
        // Use `when`, in case `body` does not return a promise.
        // When it completes loop again otherwise, if it fails, reject the
        // done promise
        Q.when(body(), loop, done.reject);
    }

    // Start running the loop in the next tick so that this function is
    // completely async. It would be unexpected if `body` was called
    // synchronously the first time.
    Q.nextTick(loop);

    // The promise
    return done.promise;
};

exports.promiseMap = function (arr, func) {
    return Q().then(function () {
        return arr.map(function (item) {
            return func(item);
        });
    }).all();
};

exports.promiseMapSeries = function (arr, iterator) {
    var currentPromise = Q();
    var promises = arr.map(function (el, index) {
        return currentPromise = currentPromise.then(function () {
            return iterator(el, index)
        })
    });
    return Q.all(promises)
};

exports.isWin = function () {
    return /^win/.test(process.platform);
};

exports.randomStr = function (count) {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    var result = [];

    var i = 0;
    while (i++ < count) {
        result.push(s4());
    }

    return result.join("");
};

exports.getClientIp = function (req) {
    var ip =
        req.headers['X-Forwarded-For'] ||
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        "127.0.0.1";

    if (ip) {
        ip = ip.split(",")[0].replace(/[^0-9\.]/g, "");
    }
    return ip;
};

var SERVER_HOST_NAME = os.hostname();
exports.getServerHostName = function () {
    return SERVER_HOST_NAME;
};

var PWD = "89adfaa48816f13527d614be756b3de4";

exports.encrypt = function (str, secret) {
    secret = secret || PWD;
    var cipher = crypto.createCipher('aes-256-cbc', secret);
    var cryptedBuffers = [cipher.update(new Buffer(str))];
    cryptedBuffers.push(cipher.final());
    var crypted = Buffer.concat(cryptedBuffers);
    return crypted.toString("hex")
};

exports.decrypt = function (str, secret) {
    secret = secret || PWD;
    var dcipher = crypto.createDecipher('aes-256-cbc', secret);
    var dcryptedBuffers = [dcipher.update(new Buffer(str, "hex"))];
    dcryptedBuffers.push(dcipher.final());
    var dcrypted = Buffer.concat(dcryptedBuffers)
        .toString('utf8');
    return dcrypted;
};

exports.md5 = function (str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};

exports.updateUrlParameter = function (url, param, value) {
    var regex = new RegExp("([\&\?]" + param + "=)[^\&]+", "i");
    var url2 = '';

    if (value !== "") {
        value = encodeURIComponent(value);
        var replaced = url.search(regex) >= 0;
        if (replaced) {
            url2 = url.replace(regex, '$1' + value);
        } else {
            var sep = '';

            if (url.indexOf('?') < 0) {
                sep = '?';
            } else if (!/[?&]$/.test(url)) {
                sep = '&';
            }

            url2 = url + sep + param + "=" + value;
        }
    } else {
        var matches = url.match(regex);
        var flag = matches && matches.length > 1 && matches[1][0] === "?";

        url2 = url.replace(regex, flag ? "?" : "");
    }

    url2 = url2.replace(/\?\&/, '?').replace(/[?&]$/, '');

    return url2;
};

exports.formatDate = function (thisDate) {
    if (thisDate && thisDate.constructor === Date) {
        return dateformat(thisDate, "UTC:m/d/yyyy hh:MM TT");
    }
    return function (val) {
        var result = "";
        if (val) {
            val = this[val];
            if (val && val.constructor === Date) {
                result = dateformat(val, "UTC:m/d/yyyy hh:MM TT");
            }
        }
        return result;
    };
};

exports.formatUrlParams = function (url) {
    if (url) {
        var result = url.replace(/[^a-zA-Z0-9]/ig, " ")
            .replace(/[ ]+/ig, "-")
            .toLowerCase();
        if (result) {
            var arr = result.split("-");
            arr = arr.slice(0, 10);
            result = arr.join('-');
        }

        return result;
    }
    return url;
};

exports.encodeUrlParams = function (val) {
    if (val) {
        return encodeURIComponent(val);
    }
    return val;
};

exports.isEmptyString = function (str) {
    var result = _.isEmpty(str);

    return result;
};

exports.isEqualStringIgnoreCase = function (strA, strB) {
    var result = strA === strB;

    if (!result) {
        result = (strA || '').toLowerCase().trim() === (strB || '').toLowerCase().trim();
    }

    return result;
};

exports.parseQueryString = function (queryString) {
    if (!queryString) {
        return null;
    }

    var params = {};

    var pairs = queryString.replace('?', '').split('&');

    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var kv = pair.split('=');

        var key = decodeURIComponent(kv[0]);
        if (key) {
            var value = "";

            if (kv.length === 2) {
                value = decodeURIComponent(kv[1]);
            }

            params[key] = value;
        }
    }

    return params;
};

exports.parseBool = function (str) {
    var text = str ? str.toLowerCase() : null;

    switch (text) {
        case "true":
        case "yes":
        case "1":
            return true;
        case "false":
        case "no":
        case "0":
            return false;
        default:
            return Boolean(text);
    }
};

exports.buildImageUrl = function (fileName) {
    return config.app.resourceUrl + "/" + fileName;
}

exports.buildResult = function (code, data, message) {
    return {
        Code: code,
        Data: data,
        Message: message
    };
};

exports.buildSuccessResult = function (data, message) {
    return {
        Code: 0,
        Data: data,
        Message: message || "处理成功"
    };
};

exports.buildErrorResult = function (errorCode, data, message) {
    return {
        Code: errorCode || 1,
        Data: data,
        Message: message || "处理失败"
    };
};

exports.defaultPageSize = 20;

exports.buildListInfo = function (pageIndex, pageSize, totalCount, url) {
    var listInfo = {
        IsEnd: pageIndex * pageSize >= totalCount,
        ListCount: pageSize,
        TotalCount: totalCount,
        PageNumber: pageIndex
    };

    return listInfo;
};

function formatMoney(amount) {
    var formatMoneyInternal = function (amount, base, unit) {
        if (Math.floor(amount / base) * base === amount) {
            amount = util.format("%s%s", Math.floor(amount / base), unit);
        }

        return amount;
    };

    if (amount >= 1000 && amount < 10000) {
        amount = formatMoneyInternal(amount, 1000, "千");
    }
    else if (amount >= 10000) {
        amount = formatMoneyInternal(amount, 10000, "万");
    }

    return amount;
}

function formatRate(rate) {
    if (Math.ceil(rate) === Math.floor(rate)) {
        rate = Math.floor(rate);
    }

    return rate;
}

exports.isCellPhoneValid = function (cellPhone) {
    return /^(0|86|17951)?(13[0-9]|15[012356789]|17[0678]|18[0-9]|14[57])[0-9]{8}$/.test(cellPhone);
};

exports.maskCellPhone = function (cellPhone) {
    var result = cellPhone;

    if (_.isString(cellPhone)) {
        result = cellPhone.replace(/(.*1\d{2})\d{6}(\d{2})/, "$1******$2")
    }

    return result;
};

/*
 * 验证身份证号
 * */
exports.isIdentityCardValid = function (identityCard) {
    //return /^(\d{6})(18|19|20)?(\d{2})([01]\d)([0123]\d)(\d{3})(\d|X|x)+$/.test(identityCard);
    return idCardValidator(identityCard);
};

var regexStaticRes = /\.(jpg|jpeg|png|gif|js|css|eot|woff|ttf|svg|htc)|faq.html$/i;

exports.isStaticResUrl = function (url) {
    return regexStaticRes.test(url);
};

exports.maskString = function (str) {
    if (!str) {
        return "";
    }

    var formatStr = function (str, headVisibleLen, tailVisibleLen) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            if (i < headVisibleLen || i >= str.length - tailVisibleLen) {
                result.push(str[i]);
            }
            else {
                result.push("*");
            }
        }

        return result.join("");
    };
    var result = [];
    if (str.length >= 11) {
        return formatStr(str, 3, 4);
    }
    else if (str.length >= 6) {
        return formatStr(str, 2, 3);
    }
    else if (str.length >= 3) {
        return formatStr(str, 1, 1);
    }
    else {
        return formatStr(str, 1, 0);
    }
};

exports.buildValidateErrorMessages = function (errors) {
    var keyMapping = {};
    var messages = [];

    _.each(errors, function (error) {
        if (!keyMapping[error.param]) {
            keyMapping[error.param] = true;

            messages.push(error.msg);
        }
    });

    return messages.join("\n");
};

exports.safeDecodeURIComponent = function (encodedStr) {
    if (encodedStr === undefined || encodedStr === null) {
        encodedStr = "";
    }

    var result = encodedStr;

    try {
        result = decodeURIComponent(encodedStr);
    }
    catch (err) {
    }

    return result;
};

exports.lowerCaseKeys = function (item) {
    if (util.isArray(item)) {
        return item;
    }
    else if (typeof item === "object") {
        var result = {};
        for (var key in item) {
            result[key.toLowerCase()] = this.lowerCaseKeys(item[key]);
        }

        return result;
    }
    else {
        return item;
    }
};

exports.getFullUrlSync = function (req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
};

exports.buildQueryPageInfo = function (pageInfo) {
    pageInfo.PageIndex = parseInt(pageInfo.PageIndex || 1);
    pageInfo.PageSize = parseInt(pageInfo.PageSize || 10);
    return {
        Start: pageInfo.PageSize * (pageInfo.PageIndex - 1),
        Count: pageInfo.PageSize
    }
};

exports.buildQueryPageResult = function (results, pageInfo) {
    if (!results || results.length == 0) {
        return null;
    }
    var totalCount = results[0][0].TotalCount;
    return {
        ItemList: results[1],
        ListInfo: {
            IsEnd: pageInfo.PageSize * pageInfo.PageIndex >= totalCount,
            PageSize: pageInfo.PageSize,
            TotalCount: totalCount,
            PageIndex: pageInfo.PageIndex
        }
    };
};

exports.getUuidWithoutHyphen = function () {
    return uuid.v4().replace(/-/g, '');
}