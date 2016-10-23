/**
 * Created by Tran Viet Thang on 10/23/2016.
 */
var User = require('../models/User');
var validator = require('validator');

/**
 * Validate an email
 * @param email email
 * @param next Callback function {function(error)}
 * @returns {*}
 */
var validateEmail = function (email, next) {

    if (!email) {
        return next(new Error("Null email."));
    }

    if (!validator.isEmail(email)) {
        return next(new Error("Invalid email."));
    }

    return next(null);
};

exports.validateEmail = validateEmail;
/**
 * Validate a password
 * @param password password
 * @param next Callback function {function(result, message)}
 * @returns {*}
 */
var validatePassword = function (password, next) {

    if (!password) {
        return next(new Error("Null password."));
    }

    if (password.length < 6) {
        return next(new Error("Password is too short"));
    }

    if (validator.isEmpty(password)) {
        return next(new Error("Empty password"));
    }

    return next(null);
};

exports.validatePassword = validatePassword;

/**
 * Validate a registration by email and password
 * @param email
 * @param password
 * @param next Callback function {function(result, message)}
 */
var validateRegistration = function (email, password, next) {
    console.log(email + " " + password);

    validateEmail(email, function (err) {
        if (err) {
            return next(err);
        }

        User.findOne({username: email}, function (err, user) {
            if (err) {
                return next(err);
            }

            if (user) {
                return next(new Error("Username already exits."));
            }

            validatePassword(password, function (err) {
                if (err) {
                   return next(err);
                }

                return next(null);
            })
        });
    })

};

exports.validateRegistration = validateRegistration;