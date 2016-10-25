var commentDb = require('../db_conf/db_comment.js');
var db = require('../common/db_mysql_q.js')();
var businessError = require('../common/businesserror');
var logger = require('../common/logger')("service");
var enums = require('../common/enums');

exports.queryCommentList = function () {

};

exports.saveComment = function (comment) {
    comment.Status = enums.commonStatus.valid;
    return db.executeSql(commentDb.addComment, comment)
        .then(function (result) {
            comment.ID = result.insertId;
            return comment;
        })
};