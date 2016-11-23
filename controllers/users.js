/*
 * Project: ThesisMgr-Server
 * File: controllers\users.js
 */


var createResponse = require('../helpers/response').createRes;
var bcrypt = require('bcrypt-nodejs');
var _ = require('underscore');
var nodemailer = require('nodemailer');
var mailTransportConfig = require('../config/mail').transportConfig;
var fs = require('fs');
var util = require('util');
var getModels = require('express-waterline').getModels;
var numberOfUsersPerPage = require('../config/pagination').numberOfUsersPerPage;


exports.getUserListPage = function (role) {
    return function (req, res) {
        getModels('office').then(function (Office) {
            Office.find().exec(function (error, offices) {
                if (error) {
                    return req.flash('errorMessage', error.message);
                }


                var filteredOffices = offices.filter(function (office) {
                    if (office.left == 1) {
                        return false
                    } else {
                        return true
                    }
                })

                res.render('./users/' + role + 's', {
                    offices: _.map(filteredOffices, function (office) {
                        return office.toObject();
                    })
                })
            })
        })
    }
};

/**
 * Get all users by role
 * @param role role of user
 */
exports.getAllUsers = function (role) {
    return function (req, res) {

        req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

        var errors = req.validationErrors();

        if (errors) {
            return res.status(400).send(createResponse(false, null, errors[0].msg));
        }

        getModels('user').then(function (User) {
            User.find({
                role: role
            }).paginate({
                page: req.query.page,
                limit: numberOfUsersPerPage
            }).exec(function (err, moderators) {
                if (err) {
                    return res.send(createResponse(false, {}, err.message));
                }

                var resModerators = _.map(moderators, function (moderator) {
                    return _.omit(moderator.toObject(), 'password')
                });

                return res.send(createResponse(true, null, resModerators));
            })
        });

    }
};

/**
 * Get an user by id and role
 * @param role: role of user
 */
exports.getUserByID = function (role) {
    return function (req, res) {
        getModels('user').then(function (User) {
            var id = req.params.id;
            User.findOne(
                {
                    id: id,
                    role: role
                },
                function (err, user) {
                    if (err) {
                        return res.send(createResponse(false, {}, err.message));
                    }

                    return res.send(createResponse(true, null, _.omit(user.toObject(), 'password')));
                });
        });

    }
};

/**
 * Create an user with a role
 * @param role: role of user
 */
exports.createUser = function (role) {
    return function (req, res) {

        // validation
        req.checkBody('officer_number', 'Invalid officer number.').notEmpty().isOfficerNumberAvailable();
        req.checkBody('username', 'Invalid username').notEmpty().isEmail();
        req.checkBody('username', 'Username taken').isUsernameAvailable();
        req.checkBody('office_id', 'Invalid office ID').notEmpty().isOfficeIDAvailable();
        req.checkBody('full_name', 'Invalid full name').notEmpty();

        req.asyncValidationErrors()
            .then(function () {

                // create user

                var officerNumber = req.body.officer_number;
                var username = req.body.username;
                var password = randomstring.generate(10);
                var officeID = req.body.office_id;
                var fullName = req.body.full_name;

                getModels('user').then(function (User) {

                    User.create({
                        officerNumber: officer_number,
                        username: username,
                        password: password,
                        officeID: officeID,
                        fullName: fullName,
                        role: role
                    }).exec(function (error, newUser) {
                        if (error) {
                            return res.send(createResponse(false, {}, error.message));
                        }

                        return res.send(createResponse(true,
                            newUser,
                            "Create account successfully!"));
                    });
                });
            })
            .catch(function (errors) {
                console.log(errors.length);
                console.log(errors);
                return res.status(400).send(createResponse(false, null, errors[0].msg));
            });
    };
};

/**
 * Create a list of user using xlsx
 * @param role role of users
 * @returns {*}
 */
exports.createUsingXLSX = function (role) {
    return function (req, res) {
        var mailTransporter = nodemailer.createTransport(mailTransportConfig);

        // check received file
        var fileInfo = req.file;

        console.log(fileInfo);

        if (fileInfo == null || fileInfo.mimetype != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            return res.status(400).send(createResponse(false, null, "Invalid xlsx file"));
        }

        getModels('user').then(function (User) {
            User.createUsingXLSX(role, fileInfo.path, mailTransporter, 'uendno@gmail.com', function (errors) {

                // delete file
                fs.unlink(fileInfo.path, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });

                console.log(errors);

                if (errors && errors.length > 0) {
                    return res.status(500).send(createResponse(false, errors, 'There are some error.'));
                }

                return res.send(createResponse(true, null, "Successfully!"));

            })
        });
    }
};