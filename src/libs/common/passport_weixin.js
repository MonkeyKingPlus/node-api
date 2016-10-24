/**
 * Module dependencies.
 */
var util = require("util");

var passport = require("passport");
var _ = require("underscore");
var Q = require("q");

/**
 * `Strategy` constructor.
 *
 * @param {Object} options
 * @api public
 */
function Strategy(verify) {
    this.verify = verify;

    passport.Strategy.call(this);
    this.name = 'weixin';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on remember me cookie.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
    var self = this;

    function verified(err, user, info) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(info); }
        self.success(user, info);
    }

    try {
        this.verify(req, verified);
    } catch (ex) {
        return self.error(ex);
    }

};

/**
 * Expose `Strategy`.
 */ 
module.exports = Strategy;
