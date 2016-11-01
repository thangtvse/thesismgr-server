/*
 * Project: ThesisMgr-Server
 * File: helpers\validator.js
 */

var User = require('../models/User');
var Field = require('../models/Field');
var Office = require('../models/Office');


module.exports = {

    isOfficerNumberAvailable: function (officerNumber) {
        return new Promise(function (resolve, reject) {
            User.findOne({ officerNumber: officerNumber })
                .then(function (user) {
                    if (!user) {
                        resolve();
                    } else {
                        reject(user);
                    }
                })
                .catch(function (error) {
                    if (error) {
                        reject(error);
                    }
                });
        });
    },

    isUsernameAvailable: function (username) {
        return new Promise(function (resolve, reject) {
            User.findOne({ username: username })
                .then(function (user) {
                    if (!user) {
                        resolve();
                    } else {
                        reject(user);
                    }
                })
                .catch(function (error) {
                    if (error) {
                        reject(error);
                    }
                });
        });
    },

    isOfficeIDAvailable: function (officeID) {
        return new Promise(function (resolve, reject) {
            Office.findOne({ _id: officeID })
                .then(function (office) {
                    if (office) {
                        resovle;
                    } else {
                        reject(office)
                    }
                })
                .catch(function (error) {
                    if (error) {
                        reject(error);
                    }
                })
        })
    },

    isFieldIDAvailable: function (fieldID) {
        return new Promise(function (resolve, reject) {
            Field.findOne({ _id: fieldID })
                .then(function (field) {
                    if (field) {
                        resovle;
                    } else {
                        reject(field)
                    }
                })
                .catch(function (error) {
                    if (error) {
                        reject(error);
                    }
                })
        })
    }

}
// /**
//  * Validate an email. 
//  *  Callback function contains an error if this registration is invalid. If it's valid, the error will be null 
//  * @param {String} email email
//  * @param {function(Error)} next Callback function 
//  * @returns {*}
//  */
// var validateEmail = function (email, next) {

//     console.log("validating email: " + email);

//     if (!email) {
//         return next({
//             message: "Null email."
//         });
//     }

//     if (!validator.isEmail(email)) {
//         return next({
//             message: "Invalid email."
//         });
//     }

//     return next(null);
// };

// exports.validateEmail = validateEmail;

// /**
//  * Validate a password.
//  *  Callback function contains an error if this registration is invalid. If it's valid, the error will be null 
//  * @param {String} password password
//  * @param {function(Error)} next Callback function
//  */
// var validatePassword = function (password, next) {

//     if (!password) {
//         return next({
//             message: "Null password."
//         });
//     }

//     if (password.length < 6) {
//         return next({
//             message: "Password is too short"
//         });
//     }

//     if (validator.isEmpty(password)) {
//         return next({
//             message: "Empty password"
//         });
//     }

//     return next(null);
// };

// exports.validatePassword = validatePassword;

// /**
//  * Validate a registration by email and password.
//  *  Callback function contains an error if this registration is invalid. If it's valid, the error will be null 
//  * @param {String} email
//  * @param {String} password
//  * @param {function(Error)} next Callback function
//  */
// var validateRegistration = function (email, password, next) {

//     validateEmail(email, function (err) {

//         if (err) {
//             return next(err);
//         }

//         User.findOne({ username: email }, function (err, user) {
//             if (err) {
//                 return next(err);
//             }

//             if (user) {
//                 return next({
//                     message: "Username already exits."
//                 });
//             }

//             validatePassword(password, function (err) {
//                 if (err) {
//                     return next(err);
//                 }

//                 return next(null);
//             })
//         });
//     })
// };

// exports.validateRegistration = validateRegistration;


// /**
//  * Validate a login. Callback function contains an error if username or password is invalid,
//     a null error and a false result if both are vaild but password doesn't match with the on in the database,
//     a null error and a true result if both are valid and the password matches
//  * @param email {String} user email
//  * @param password {String} user password
//  * @param next {function(Error, Boolean)} callback function. It returns an error if username or password is invalid, returns an false reulst if both are vaild but password is not match with the on in the database
//  */
// var validateLogin = function (email, password, next) {
//     validateEmail(email, function (err) {

//         if (err) {
//             return next(err);
//         }

//         User.findOne({ username: email }, function (err, user) {
//             if (err) {
//                 return next(err);
//             }

//             if (!user) {
//                 return next({
//                     message: "User not found."
//                 });
//             }

//             bcrypt.compare(password, user.password, function (err, result) {

//                 if (err) {
//                     return next({ message: err }, null);
//                 }

//                 return next(null, result, user);

//             })
//         });
//     })
// }

// exports.validateLogin = validateLogin;



