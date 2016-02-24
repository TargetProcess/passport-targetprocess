/* global describe, it, expect, before */

var chai = require('chai')
  , Strategy = require('../lib/strategy');

console.log('safdsadfdsf',typeof chai.passport)
describe('Strategy', function() {
    
  describe('encountering an error during verification', function() {
    var strategy = new Strategy(function(user, done) {
      done(new Error('something went wrong'));
    });
    strategy._makeRequest = function () {
        return Promise.resolve({});
    };
    var err;
    
    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body.username = 'johndoe';
          req.body.host = 'host';
          req.body.password = 'secret';
        })
        .authenticate();
    });
    
    it('should error', function() {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('something went wrong');
    });
  });
  
  describe('encountering an exception during verification', function() {
    var strategy = new Strategy(function(user, done) {
      throw new Error('something went horribly wrong');
    });
    strategy._makeRequest = function () {
      return Promise.resolve({});
    };
    var err;
    
    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          req.body = {};
          req.body.username = 'johndoe';
          req.body.host = 'host';
          req.body.password = 'secret';
        })
        .authenticate();
    });
    
    it('should error', function() {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('something went horribly wrong');
    });
  });
  
});
