var commentDb = require('../db_conf/db_comment.js');
var db = require('../common/db_mysql_q.js')();
var businessError = require('../common/businesserror');
var logger = require('../common/logger')("service");
var helper = require('../common/helper');
var enums = require('../common/enums');

exports.queryCommentList = function (articleid, pageSize, pageIndex) {
    var queryFilter = helper.buildQueryPageInfo({
        PageIndex: pageIndex,
        PageSize: pageSize
    });
    queryFilter.ArticleInfoID = articleid;

    return db.executeSql(commentDb.queryComment, queryFilter)
        .then(function(results){
            
        });
};

exports.saveComment = function (comment) {
    comment.Status = enums.commonStatus.valid;
    return db.executeSql(commentDb.addComment, comment)
        .then(function (result) {
            comment.ID = result.insertId;
            return comment;
        })
};