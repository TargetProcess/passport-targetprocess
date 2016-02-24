/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
    , Strategy = require('../lib/strategy');


describe('Strategy', function () {

    describe('handling a request with valid credentials in body using custom field names', function () {
        var strategy = new Strategy({
            usernameField: 'userid',
            passwordField: 'passwd',
            hostField: 'url'
        }, function (user, done) {
            return done(null, {id: '1234'}, {scope: 'read'});
        });
        strategy._makeRequest = function (url, user) {
            if (url == 'johndoe/api/v1/Users/LoggedUser?format=json&include[id,email]' && user.username == 'johndoe' && user.password == 'secret') {
                return Promise.resolve({});
            } else {
                return Promise.reject({});
            }

        };
        var user
            , info;

        before(function (done) {
            chai.passport.use(strategy)
                .success(function (u, i) {
                    user = u;
                    info = i;
                    done();
                }).error()
                .req(function (req) {
                    req.body = {};
                    req.body.userid = 'johndoe';
                    req.body.url = 'johndoe';
                    req.body.passwd = 'secret';
                })
                .authenticate();
        });

        it('should supply user', function () {
            expect(user).to.be.an.object;
            expect(user.id).to.equal('1234');
        });

        it('should supply info', function () {
            expect(info).to.be.an.object;
            expect(info.scope).to.equal('read');
        });
    });

    describe('handling a request with valid credentials in body using custom field names with object notation', function () {
        var strategy = new Strategy({
            usernameField: 'user[username]',
            passwordField: 'user[password]',
            hostField: 'user[host]'
        }, function (user, done) {
            return done(null, {id: '1234'}, {scope: 'read'});
        });
        strategy._makeRequest = function (url, user) {
            if (url == 'johndoe/api/v1/Users/LoggedUser?format=json&include[id,email]' && user.username == 'johndoe' && user.password == 'secret') {
                return Promise.resolve({});
            } else {
                return Promise.reject({});
            }
        };
        var user
            , info;

        before(function (done) {
            chai.passport.use(strategy)
                .success(function (u, i) {
                    user = u;
                    info = i;
                    done();
                })
                .req(function (req) {
                    req.body = {};
                    req.body.user = {};
                    req.body.user.username = 'johndoe';
                    req.body.user.host = 'johndoe';
                    req.body.user.password = 'secret';
                })
                .authenticate();
        });

        it('should supply user', function () {
            expect(user).to.be.an.object;
            expect(user.id).to.equal('1234');
        });

        it('should supply info', function () {
            expect(info).to.be.an.object;
            expect(info.scope).to.equal('read');
        });
    });

});
