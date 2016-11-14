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

/**
 * Get all moderators
 * @param req
 * @param res
 */
exports.getAllModerator = function (req, res) {
    getModels('user').then(function (User) {
        User.find({
            role: 'moderator'
        }).paginate({
            page: req.query.page,
            skip: 10
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
};



/**
 * Get an user by id
 * @param req
 * @param res
 */
exports.getUserByID = function (req, res) {

    getModels('user').then(function (User) {
        var id = req.params.id;
        User.findOne(
            {
                id: id,
                role: {
                    $in: ['lecturer', 'student', 'moderator']
                }
            },
            function (err, user) {
                if (err) {
                    return res.send(createResponse(false, {}, err.message));
                }

                return res.send(createResponse(true, null, _.omit(user.toObject(), 'password')));
            });
    });

};



// get a moderator by id
exports.getModeratorByID = function (req, res) {
    var id = req.params.id;
    getModels('user').then(function (User) {
        User.findOne(
            {
                _id: id,
                role: 'moderator'
            },
            function (err, user) {
                if (err) {
                    return res.send(createResponse(false, {}, err.message));
                }

                return res.send(createResponse(true, null, _.omit(user.toObject(), 'password')));
            });
    });
};


/**
 * Create an user
 * @param req
 * @param res
 */
exports.createUser = function (req, res) {

    // validation
    req.checkBody('officer_number', 'Invalid officer number.').notEmpty().isOfficerNumberAvailable();
    req.checkBody('username', 'Invalid username').notEmpty().isEmail();
    req.checkBody('username', 'Username taken').isUsernameAvailable();
    req.checkBody('role', 'Invalid role').notEmpty().isIn('moderator', 'lecturer', 'student');
    req.checkBody('office_id', 'Invalid office ID').notEmpty().isOfficeIDAvailable();
    req.checkBody('full_name', 'Invalid full name').notEmpty();

    req.asyncValidationErrors()
        .then(function () {

            // create user

            var officerNumber = req.body.officer_number;
            var username = req.body.username;
            var role = req.body.role;
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


/**
 * Create a list of user using xlsx
 * @param req
 * @param res
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

                if (errors && errors.length >= 0) {
                    return res.status(500).send(createResponse(false, errors, 'There are some error.'));
                }

                return res.send(createResponse(true, null, "Successfully!"));

            })
        });
    }
};