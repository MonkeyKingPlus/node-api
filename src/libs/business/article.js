/**
 * Created by Jared.M.Luo on 16/10/25.
 */

var articleDb = require('../db_conf/db_article.js');
var db = require('../common/db_mysql_q.js')();
var helper = require('../common/helper.js');

exports.articleList = function (pageSize, pageIndex) {
    var pageInfo = {
        pageSize: pageSize,
        pageIndex: pageIndex
    };
    var body = helper.buildQueryPageInfo(pageInfo);

    return db.executeSql(articleDb.getArticleList, body).then(function (results) {
        return helper.buildQueryPageResult(results, pageInfo);
    });
};

exports.articleDetail = function (articleID) {
    return db.executeSqlOne(articleDb.getArticleDetail, [articleID]).then(function(result){
        return result;
    });
};