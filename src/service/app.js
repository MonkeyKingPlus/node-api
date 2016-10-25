var express = require('express');
var glob = require('glob-all');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var compression = require('compression');
var expressValidator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var libs = require("../libs");
var userRecoveryStrategy = libs.common.passport_user_recovery_strategy;
var weixinStrategy = libs.common.passport_weixin_strategy;
var weixin_user_initializer = libs.middleware.weixin_user_initializer;
var config = libs.common.config;
var helper = libs.common.helper;
var middleware = libs.middleware;
var auth = libs.business.authorization;
var logger = libs.common.logger("service");
var timeout = require('connect-timeout');
var app = express();

app.disable('x-powered-by');
app.disable('etag');
app.enable('trust proxy');

var env = process.env.NODE_ENV || 'development';
global.ENV = app.locals.ENV = env;
global.ENV_DEVELOPMENT = app.locals.ENV_DEVELOPMENT = env == 'development';

app.use(timeout('90s'));
app.use(express.static(config.root + '/service/public', {
    maxAge: global.ENV_DEVELOPMENT ? 0 : 30 * 24 * 3600 * 1000,
    etag: false
}));

if (global.ENV == "development" || global.ENV == "test") {
    require("./swagger")(app,
        {
            port: config.port,
            basePath: "/v1",
            apis: glob.sync(config.root + '/service/controllers/**/*.js')
        });
}

app.use(compression());
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(expressValidator());
libs.common.validatorExtender.extend(expressValidator.validator);
app.use(cookieParser());
app.use(methodOverride());

app.use(libs.middleware.express_extender());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("access-control-allow-methods", "GET, POST");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, x-mkp-authentication,x-weixin-code");
    next();
});

app.use(passport.initialize());

app.use(passport.authenticate('recovery-me'));
var authTokenHeaderConfigItem = userRecoveryStrategy.generateHeaderConfigItem("x-mkp-authentication",
    auth.verifyAuthToken(),
    auth.updateAuthToken());
passport.use(new userRecoveryStrategy([authTokenHeaderConfigItem]));

passport.use(new weixinStrategy(auth.authenticateWeiXin()));

passport.use(new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'LoginName',
    passwordField: 'Password'
}, auth.authenticate()));
passport.serializeUser(auth.serializeUser());
passport.deserializeUser(auth.deserializeUser());

var controllers = glob.sync(config.root + '/service/controllers/**/*.js');
controllers.forEach(function (controller) {
    require(controller)(app);
});


app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(middleware.errorhandler_express(logger));

// error handlers
process.on('uncaughtException', function (err) {
    logger.error("uncaughtException:" + err.stack);
});

var server = app.listen(config.port, function () {
    logger.info('Express server listening on port ' + server.address().port);
});
