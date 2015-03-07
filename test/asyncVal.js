var validate = require('validate.js');
var Promise = require('bluebird');
var PouchDB = require('pouchdb');
var seed = require('pouchdb-seed-design');
var userDB = new PouchDB('http://localhost:5984/test_users');
// var userDB = new PouchDB('test_users', {db : require('memdown')});

var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
var USER_REGEXP = /^[a-z0-9_-]{3,16}$/;

validate.Promise = function(callback) {
  return new Promise(callback);
};

var validateUsername = function(username) {
  return new Promise(function(resolve, reject) {
    if(!username.match(USER_REGEXP)){
      console.log('rejecting invalid username');
      return reject('invalid username');
    }
    console.log('Querying username: ' + username);
    userDB.query('auth/username', {key: username})
      .then(function(result) {
        if(result.rows.length === 0) {
          return resolve(true);
        }
        else {
          return reject('already in use');
        }
      }, function(err) {
        return reject('database error');
      });
  });
};

var validateEmail = function(email) {
  return new Promise(function(resolve, reject) {
    if(!email.match(EMAIL_REGEXP)){
      console.log('rejecting invalid email');
      return reject('invalid email');
    }
    console.log('Querying email: ' + email);
    userDB.query('auth/email', {key: email})
      .then(function(result) {
        if(result.rows.length === 0) {
          return resolve(true);
        }
        else {
          return reject('already in use');
        }
      }, function(err) {
        return reject('database error');
      });
  });
};

validate.validators.validateEmail = validateEmail;
validate.validators.validateUsername = validateUsername;

var constraints = {
  _id: {
    presence: true,
    validateUsername: true
  },
  email: {
    presence: true,
    validateEmail: true
  }
};

var design = {
  auth: {
    views: {
      email: function(doc) {
        if(doc.email) {
          emit(doc.email, null);
        }
      },
      username: function(doc) {
        emit(doc._id, null);
      }
    }
  }
};

var doc = {
  _id: 'superuser',
  email: 'superuser@example.com'
};

console.log('Seeding design docs');
seed(userDB, design)
  .then(function() {
    console.log('Writing document');
    return userDB.put(doc);
  })
  .then(function() {
    validate.async(doc, constraints)
      .then(function() {
        console.log("Error: validation succeeded, but it shouldn't have");
      }, function(err) {
        console.log('Validation errors:');
        console.log(err);
      })
      .then(function() {
        console.log('Destroying test database');
        return userDB.destroy();
      })
      .then(function() {
        console.log('database destroyed successfully');
      })
      .done();
  })
  .catch(function(err) {
    console.log('Other database error: ');
    console.log(err);
  });