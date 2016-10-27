/**
 * Created by Jared.M.Luo on 16/10/25.
 */
var express = require('express');
var router = express.Router();

var util = require('util');

var Q = require('q');

var libs = require("../../libs");
var articleBL = libs.business.article;
var requireAuth = libs.middleware.auth_service();
var helper = libs.common.helper;

module.exports = function(app){
    app.use('/v1/article', router);
};

router.get('/',  function(req, res, next){
    articleBL.articleList(req.query.pagesize, req.query.pageindex).then(function(result){
        res.send(helper.buildSuccessResult(result));
    }).catch(function(err){
        next(err);
    });
});