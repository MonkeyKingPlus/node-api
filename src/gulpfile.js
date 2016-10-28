var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    concat = require('gulp-concat'),
    wrap = require('gulp-wrap'),
    declare = require('gulp-declare'),
    path = require("path"),
    os = require("os"),
    fs = require("fs"),
    argv = require('yargs').argv,
    zip = require('gulp-zip'),
    gulpSequence = require('gulp-sequence'),
    exit = require('gulp-exit'),
    util = require("util"),
    mkpSSH = require('./gulpfile/mkp-ssh');

var cfg;

function getEnvConf(type) {
    var conf = {};
    conf.env = argv.env || "test";
    conf.type = type;
    conf.rootDir = path.normalize(path.join(__dirname, type));
    conf.distDir = path.normalize(path.join(__dirname, "/dist"));
    conf.distTempDir = path.normalize(__dirname + "/dist/temp");
    console.log("env: %s", conf.env);
    console.log("root dir : %s", conf.rootDir);
    console.log("dist dir : %s", conf.distDir);
    return conf;
}

//develop service
gulp.task('s', function () {
    nodemon({
        script: 'service/app.js',
        ext: 'js',
        ignore: ['dist/**', 'node_modules/**']
    });
});

//gulp.task('deploy-service-es6', function () {
//    gulp.src(['*json', 'config/common/*.json', 'service/public/**', "swagger/models/*.json"], {base: './'})
//        .pipe(gulp.dest('dist'));
//    //var deploySrc = ['dist/**'];
//    //deployService(deploySrc);
//});

gulp.task('deploy-service', function () {
    deployService(["*js", "*json", "config/**", "libs/**", "service/**", "swagger/models/*.json"]);//只发swagger下的json文件
});
gulp.task('deploy-service-first', function () {
    deployService(["*js", "*json", "config/**", "libs/**", "service/**", "swagger/**"]);
});

function deployService(source) {
    var deployConfig = {
        test: {
            servers: [{
                sshConfig: {
                    host: 'ec2-54-249-7-123.ap-northeast-1.compute.amazonaws.com',
                    port: 22,
                    username: 'ec2-user',
                    privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh/monkeyplus')),
                    readyTimeout: 200000
                }
            }],
            deployPath: "/home/ec2-user/mkp",
            deploySrc: [],
            deployServers: []
        },
        production: {
            servers: [{
                sshConfig: {
                    host: 'ec2-54-249-7-123.ap-northeast-1.compute.amazonaws.com',
                    port: 22,
                    username: 'ec2-user',
                    privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh/monkeyplus')),
                    readyTimeout: 200000
                }
            }],
            deployPath: "/home/ec2-user/mkp",
            deploySrc: [],
            deployServers: []
        }
    };

    var env = argv.env || "test";
    cfg = deployConfig[env];
    cfg.isDevelopment = false;
    cfg.deploySrc = source;
    cfg.deployPath = cfg.deployPath + "/srv";
    cfg.deployServers = cfg.servers;

    var envCfg = getEnvConf("service");
    var logName = "deploy-" + envCfg.type;

    return gulp.src(cfg.deploySrc, {base: './'})
        .pipe(zip('publish.zip'))
        .pipe(mkpSSH({
            servers: cfg.deployServers,
            dest: cfg.deployPath + '/publish.zip',
            shell: ['cd ' + cfg.deployPath,
                'shopt -s extglob',
                'rm -rf !(logs|node_modules|publish.zip|swagger)',
                'unzip -o publish.zip -d dist',
                'cp -rf dist/** .',
                'rm -rf dist',
                "rm publish.zip",
                "mv  service/public/faq.html service/public/faq_1.html",
                'sleep 15',
                'npm install --production',
                'pm2 startOrRestart pm2-service-' + env + '.json',
                "mv service/public/faq_1.html service/public/faq.html",
                'sleep 15'
            ],
            logPath: logName
        })).pipe(exit());
}
