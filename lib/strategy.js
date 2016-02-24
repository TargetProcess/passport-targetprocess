var passport = require('passport-strategy');
var util = require('util');
var lookup = require('./utils').lookup;
var request = require('request');

function Strategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) {
        throw new TypeError('TargetprocessStrategy requires a verify callback');
    }
    this._usernameField = options.usernameField || 'username';
    this._hostField = options.hostField || 'host';
    this._passwordField = options.passwordField || 'password';

    passport.Strategy.call(this);
    this.name = 'targetprocess';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;
    this._makeRequest = function (url, user, method, data) {
        method = method || 'GET';
        var options = {
            url: url,
            method: method,
            auth: {
                'user': user.username,
                'pass': user.password
            },
            json: true
        };
        if (method === 'PUT') {
            options.json = data;
        }
        return new Promise(function (resolve, reject) {
            request(options, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(err || body);
                }
            });
        });
    };
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function (req, options) {
    options = options || {};

    var username = lookup(req.body, this._usernameField) || lookup(req.query, this._usernameField);
    var host = lookup(req.body, this._hostField) || lookup(req.query, this._hostField);
    var password = lookup(req.body, this._passwordField) || lookup(req.query, this._passwordField);
    if (!username || !password || !host) {
        return this.fail({message: options.badRequestMessage || 'Missing credentials'}, 400);
    }


    var verified = (err, user, info) => {
        if (err) {
            return this.error(err);
        }
        if (!user) {
            return this.fail(info);
        }

        this.success(user, info);
    };


    this._makeRequest(host + '/api/v1/Users/LoggedUser?format=json&include[id,email]', {password, username})
        .then((body)=> {
            if (this._passReqToCallback) {
                this._verify(req, body, verified);
            } else {
                this._verify(body, verified);
            }
        })
        .catch((e)=> {
            if (e) {
                this.error(e)
            } else {
                this.fail({message: 'Invalid email/password combination'}, 401)
            }
        });

};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;