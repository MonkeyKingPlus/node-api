var multiline = require('multiline');

module.exports = {
    "login": {
        "db": "read",
        sql: multiline(function () {
            /*
             SELECT
             B.ID,
             A.Identifier,
             A.IdentityType,
             A.IsThirdParty,
             B.NickName,
             B.Avatar
             FROM User_Auth A
             INNER JOIN User_Info B ON A.UserInfoID = B.ID
             WHERE B.STATUS = 1
             A.Identifier = ? And A.Credential = ?
             */
        })
    },
    "getUserInfo": {
        "db": "read",
        sql: multiline(function () {
            /*
             SELECT
             B.ID,
             A.Identifier,
             A.IdentityType,
             A.IsThirdParty,
             B.NickName,
             B.Avatar,
             B.InDate
             FROM User_Auth A
             INNER JOIN User_Info B ON A.UserInfoID = B.ID
             WHERE B.STATUS = 1
             AND B.ID = ?
             */
        })
    },
    "getUserInfoByIdentifier": {
        "db": "read",
        sql: multiline(function () {
            /*
             SELECT
             B.ID,
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
             insert into User_Info(Status,NickName,Avatar) values(@Status,@NickName,@Avatar)
             */
        })
    },
    "bindUserAuth": {
        "db": "write",
        sql: multiline(function () {
            /*
             insert into User_Auth( UserInfoID,IdentityType,Identifier,Credential,IsThirdParty)
             values( @UserInfoID,@IdentityType,@Identifier,@Credential,@IsThirdParty)
             */
        })
    },
    "isNickNameExist": {
        "db": "write",
        sql: multiline(function () {
            /*
             SELECT NickName FROM User_Info WHERE NickName = @NickName AND ID <> @ID
             */
        })
    },
    "updateNickName": {
        "db": "write",
        sql: multiline(function () {
            /*
             UPDATE User_Info SET NickName = @NickName ,EditDate = now() WHERE ID = @ID
             */
        })
    },
    "updateAvatar": {
        "db": "write",
        sql: multiline(function () {
            /*
             UPDATE User_Info SET Avatar = @Avatar ,EditDate = now() WHERE ID = @ID
             */
        })
    }
};
