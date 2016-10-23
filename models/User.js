/**
 * Created by Tran Viet Thang on 10/22/2016.
 * User model
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    }
});

/**
 * Execute  before each user.save() call
 */
UserSchema.pre('save', function (next) {
    var user = this;

    // Break out if the password hasn't changed
    if (!user.isModified('password')){
        return next();
    }

    //Password changed so we need to hash it
    bcrypt.genSalt(5, function (err, salt) {
        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) {
                return next(err);
            }

            user.password = hash;
            next();
        })
    })
});

var User = mongoose.model('user', UserSchema);

module.exports = User;