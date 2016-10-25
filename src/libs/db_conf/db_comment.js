var multiline = require('multiline');

module.exports = {
    "addComment": {
        "db": "write",
        sql: multiline(function () {
            /*
             insert into CommentInfo(ArticleInfoID,CommentUserInfoID,Content,ChildCommentID,Status)
             values(@ArticleInfoID,@CommentUserInfoID,@Content,@ChildCommentID,@Status)
             */
        }),
        inputParams: [
            {name: "ArticleInfoID"},
            {name: "CommentUserInfoID"},
            {name: "Content"},
            {name: "ChildCommentID"},
            {name: "Status"}
        ]
    },
    "queryComment": {
        "db": "read",
        sql: multiline(function () {
            /*

             */
        }),
        inputParams: [
            {name: "ArticleInfoID"},
            {name: "PageIndex"},
            {name: "PageSize"}
        ]
    }

};
