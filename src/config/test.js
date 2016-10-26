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
        "resourceUrl": "http://ec2-54-249-7-123.ap-northeast-1.compute.amazonaws.com:3000"
    },
    "mobile": {

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
                "database": "MonkeyPlus",
                "connectTimeout": 10000,
                "dateStrings": true,
                "connectionLimit": 10,
                "multipleStatements": true
                //"ssl":{
                //    "ca":fs.readFileSync(path.normalize(rootPath + '/monkeyplus.pem'))
                //}
            }
        ],
        "write": [
            {
                "user": "monkey",
                "password": "monkey!123",
                "host": "monkeyplus.cnk9uugfwjne.ap-northeast-1.rds.amazonaws.com",
                "port": "3306",
                "database": "MonkeyPlus",
                "connectTimeout": 10000,
                "dateStrings": true,
                "connectionLimit": 10,
                "multipleStatements": true
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
                alwaysIncludePattern: true,
                backups: 3,
                maxLogSize: 1024,
                category: 'service'
            }
        ]
    },
    "cache": "memory",
    "caches": {
        "memory": {
            "name": "memory-cache",
            "timeout": timespan_hour
        }
    },
    "cacheKeys": {
        "rememberme_token": "remembermetoken:%s:%s"
    }
};

var weixinConfigs = [
    {
        name: "weixin",
        appID: "wx458c8642c3333940",
        appsecret: "290cb6e5aa49bf5b090e48733773c0d7",
        redirectUri: "http://ec2-54-249-7-123.ap-northeast-1.compute.amazonaws.com/"
    }
];

config.weixinConfigs = weixinConfigs;

weixinConfigs.forEach(function (weixinConfig) {
    config[weixinConfig.name] = weixinConfig;
});

module.exports = config;
