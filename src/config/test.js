var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    fs = require("fs");

var _ = require("underscore");

var multiline = require('multiline');

var timespan_second = 1000,
    timespan_minute = 60 * timespan_second,
    timespan_hour = 60 * timespan_minute,
    timespan_day = 24 * timespan_hour,
    timespan_month = 30 * timespan_day,
    timespan_year = 365 * timespan_day;

var config = {
    "root": rootPath,
    "port": 3000,
    "app": {
        "name": 'monkeyplus'
    },
    "cookieKeys": {
        "authToken": {
            "name": "at",
            "options": {
                "domain": "monkeyplus.com.dev",
                "path": "/",
                "maxAge": timespan_year,
                "httpOnly": false
            }
        },
        "rememberme": {
            "name": "rm",
            "options": {
                "path": "/",
                "httpOnly": true,
                "maxAge": timespan_month,
                "domain": "monkeyplus.com.dev",
                "comment": "one month"
            }
        }
    },
    "db": {
        "debug": false,
        "read": [
            {
                "user": "monkey",
                "password": "monkey!123",
                "host": "monkeyplus.cnk9uugfwjne.ap-northeast-1.rds.amazonaws.com",
                "port": "3306",
                "database": "monkeyplus",
                "connectTimeout": 10000,
                "dateStrings": true,
                "connectionLimit": 10
                //"ssl":{
                //    "ca":fs.readFileSync(path.normalize(rootPath + '/monkeyplus.pem'))
                //}
            }
        ]
    },
    "log": {
        "level": "DEBUG",
        "appenders": [
            {
                type: 'dateFile',
                filename: 'logs/log_',
                pattern: "yyyyMMdd.log",
                alwaysIncludePattern:true,
                backups: 3,
                maxLogSize: 1024,
                category: 'service'
            }
        ]
    },
    "cache":"memory",
    "caches": {
        "memory": {
            "name": "memory-cache",
            "timeout": timespan_hour
        }
    },
    "cacheKeys":{
        "rememberme_token":"remembermetoken:%s:%s"
    }
};

var weixinConfigs = [
    {
        name: "weixin",
        appID: "wxc1fdd55548b1344e",
        appsecret: "3f86e21bc033f2db51ccee6c40735ee7",
        redirectUri: "http://ec2-54-249-7-123.ap-northeast-1.compute.amazonaws.com/"
    }
];

config.weixinConfigs = weixinConfigs;

weixinConfigs.forEach(function(weixinConfig){
    config[weixinConfig.name] = weixinConfig;
});

module.exports = config;
