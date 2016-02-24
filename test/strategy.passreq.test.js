/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , Strategy = require('../lib/strategy');


describe('Strategy', function() {

  describe('passing request to verify callback', function() {
    var strategy = new Strategy({passReqToCallback: true}, function(req, user, done) {
        return done(null, { id: '1234' }, { scope: 'read', foo: req.headers['x-foo'] });
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

    before(function(done) {
      chai.passport.use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.headers['x-foo'] = 'hello';

          req.body = {};
          req.body.username = 'johndoe';
          req.body.host = 'johndoe';
          req.body.password = 'secret';
        })
        .authenticate();
    });

    it('should supply user', function() {
      expect(user).to.be.an.object;
      expect(user.id).to.equal('1234');
    });

    it('should supply info', function() {
      expect(info).to.be.an.object;
      expect(info.scope).to.equal('read');
    });

    it('should supply request header in info', function() {
      expect(info.foo).to.equal('hello');
    });
  });

});
