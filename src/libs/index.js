var requiredir = require("require-dir");

module.exports = {
    business : requiredir("./business"),
    common   : {
        config                          : require("./common/config"),
        helper                          : require("./common/helper"),
        logger                          : require("./common/logger"),
        weixin                          : require("./common/weixin"),
        db_config                       : requiredir("./db_conf"),
        restClient                      : require("./common/rest_client")(),
        businessError                   : require("./common/businesserror"),
        validatorExtender               : require("./common/validatorExtender")(),
        passport_user_recovery_strategy : require("./common/passport_user_recovery_strategy")
    },
    middleware : requiredir("./middleware")
};