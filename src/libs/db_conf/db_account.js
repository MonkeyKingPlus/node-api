var multiline = require('multiline');

module.exports = {
    "test": {
        db: "read",
        sql: multiline(function () {
            /*
             select * from Test where ID = ?
             */
        }),
        timeout: 60000
    },
    "insertTest": {
        db: "read",
        sql: multiline(function () {
            /*
             insert into Test(name) values(?)
             */
        })
    },
    "insertTestRollback": {
        db: "read",
        sql: multiline(function () {
            /*
             inserts into Test(name) values(?)
             */
        })
    },
    "login": {
        "db": "read",
        sql: multiline(function () {
            /*
             select * from User where LoginName = ? And Password = ?
             */
        })
    },
    "getUserInfo": {
        "db": "read",
        sql: multiline(function () {
            /*
             select * from User where ID = ?
             */
        })
    },
    "getUserInfoByIdentifier": {
        "db": "read",
        sql: multiline(function () {
            /*
             SELECT
                 B.ID AS UserID,
                 A.Identifier,
                 A.IdentityType,
                 A.IsThirdParty,
                 B.NickName,
                 B.Avatar,
                 B.InDate
             FROM User_Auth A
             INNER JOIN User_Info B ON A.UserInfoID = B.ID
             WHERE B.STATUS = 1
             AND A.Identifier = ?
             AND A.IdentityType = ?
             */
        })
    },
    "createUser": {
        "db": "write",
        sql: multiline(function () {
            /*
             insert into User_Info(Status) values(@Status)
             */
        }),
        inputParams: [
            {name: "Status"}
        ]
    }, "bindUserAuth": {
        "db": "write",
        sql: multiline(function () {
            /*
             insert into User_Auth( UserInfoID,IdentityType,Identifier,Credential,IsThirdParty)
             values( @UserInfoID,@IdentityType,@Identifier,@Credential,@IsThirdParty)
             */
        }),
        inputParams: [
            {name: "UserInfoID"},
            {name: "IdentityType"},
            {name: "Identifier"},
            {name: "Credential"},
            {name: "IsThirdParty"}
        ]
    }
};
