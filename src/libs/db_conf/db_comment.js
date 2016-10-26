var multiline = require('multiline');

module.exports = {
    "addComment": {
        "db": "write",
        sql: multiline(function () {
            /*
             insert into CommentInfo(ArticleInfoID,CommentUserInfoID,Content,ChildCommentID,Status)
             values(@ArticleInfoID,@CommentUserInfoID,@Content,@ChildCommentID,@Status)
             */
        })
    },
    "queryComment": {
        "db": "read",
        sql: multiline(function () {
            /*
            SELECT COUNT(1) as TotalCount FROM CommentInfo WHERE ArticleInfoID = @ArticleInfoID;

            SELECT
             A.ArticleInfoID,
             A.CommentUserInfoID,
             A.Content,
             A.LikeCount,
             A.ChildCommentID,
             A.InDate,
             A.EditDate,
             B.Content AS ParentComment
             FROM CommentInfo A
             LEFT JOIN CommentInfo B ON A.ID = B.ChildCommentID
             WHERE A.ArticleInfoID = @ArticleInfoID AND A.ID >=
             (
                 SELECT
                    A.ID
                 FROM
                 CommentInfo A
                 WHERE A.ArticleInfoID = @ArticleInfoID ORDER BY ID LIMIT 1
             )
             LIMIT @Count

             */
        })
    }

};
