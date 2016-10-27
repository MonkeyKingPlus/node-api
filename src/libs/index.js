var requiredir = require("require-dir");

module.exports = {
    business : requiredir("./business"),
    common   : {
        config                          : require("./common/config"),
        helper                          : require("./common/helper"),
        enums                           : require("./common/enums"),
        logger                          : require("./common/logger"),
        weixin                          : require("./common/weixin"),
        db_config                       : requiredir("./db_conf"),
        cache_provider                  : require("./common/cacheProvider"),
        restClient                      : require("./common/rest_client")(),
        businessError                   : require("./common/businesserror"),
        validatorExtender               : require("./common/validatorExtender")(),
        passport_user_recovery_strategy : require("./common/passport_user_recovery_strategy"),
        passport_weixin_strategy : require("./common/passport_weixin")
    },
    middleware : requiredir("./middleware")
};