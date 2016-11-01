/*
 * Project: ThesisMgr-Server
 * File: models\User.js
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Office = require('./Office');

var UserSchema = new mongoose.Schema({

    officerNumber: {
        type: String,
        unique: true,
        required: true
    },

    username: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    fullName: {
        type: String
    },

    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office'
    },

    field: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field'
    }]
});


/**
 * Execute  before each user.save() call
 */
UserSchema.pre('save', function (next) {
    var user = this;

    // Break out if the password hasn't changed
    if (!user.isModified('password')) {
        return next();
    }

    //Password changed so we need to hash it
    bcrypt.genSalt(5, function (err, salt) {
        if (err) {
            return next(err);
        }

        console.log("hashing: " + user.password);

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) {
                return next(err);
            }

            user.password = hash;
            next();
        })
    })
});

// methods
UserSchema.statics.login = function (email, password, next) {

    User.findOne({ username: email }, function (err, user) {
        if (err) {
            return next(err);
        }

        if (!user) {
            return next({
                message: "User not found."
            });
        }

        bcrypt.compare(password, user.password, function (err, result) {

            if (err) {
                return next({ message: err }, null);
            }

            return next(null, result, user);

        })
    });
}

var User = mongoose.model('user', UserSchema);

module.exports = User;