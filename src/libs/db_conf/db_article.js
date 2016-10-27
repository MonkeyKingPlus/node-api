var multiline = require('multiline');

module.exports = {
    "getArticleList": {
        "db": "read",
        sql: multiline(function () {
            /*
             SELECT COUNT(1) as TotalCount FROM Article_Info;

             SELECT
                i.*
             FROM
             (
                 SELECT
                    *
                 FROM
                    Article_Info
                 WHERE
                    ID >=(
                        SELECT
                            ID
                        FROM
                            Article_Info
                        ORDER BY
                            id
                        LIMIT @Start,1
                    ) LIMIT @Count
             ) i

             */
        })
    },
    "getArticleDetail": {
        "db": "read",
        sql: multiline(function () {
            /*
             SELECT
                i.*, d.Content
             FROM
                Article_Info i
             INNER JOIN
                Article_Detail d ON i.ArticleDetailID = d.ID
             WHERE
                i.ID = ?
             */
        })
    }
};
