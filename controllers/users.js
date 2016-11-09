/*
 * Project: ThesisMgr-Server
 * File: controllers\users.js
 */

var User = require('../models/User');
var Office = require('../models/Office');
var createResponse = require('../helpers/response').createRes;
var bcrypt = require('bcrypt-nodejs');
var _ = require('underscore');
var randomstring = require("randomstring");
var Excel = require('exceljs');
var stringSimilarity = require('string-similarity');
var nodemailer = require('nodemailer');
var mailTransportConfig = require('../config/mail').transportConfig;
var async = require('async');
var util = require('util');


/**
 * Get an user by id
 * @param req
 * @param res
 */
exports.getUserByID = function (req, res) {

    var id = req.params.id;
    User.findOne(
        {
            _id: id,
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
};

/**
 * Get all moderators
 * @param req
 * @param res
 */
exports.getAllModerator = function (req, res) {
    User.find({
        role: 'moderator'
    }, function (err, moderators) {
        if (err) {
            return res.send(createResponse(false, {}, err.message));
        }

        var resModerators = _.map(moderators, function (moderator) {
           return  _.omit(moderator.toObject(), 'password')
        });

        return res.send(createResponse(true, null, resModerators));
    })
};

// get a moderator by id
exports.getModeratorByID = function (req, res) {
    var id = req.params.id;
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
};


// Create a new user with random password
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

            var officerNumber = req.body.officer_number
            var username = req.body.username;
            var role = req.body.role;
            var password = randomstring.generate(10);
            var officeID = req.body.office_id;
            var fullName = req.body.full_name;

            var newUser = new User({
                officerNumber: officer_number,
                username: username,
                password: password,
                officeID: officeID,
                fullName: fullName,
                role: role
            });

            console.log(newUser);

            newUser.save(function (err, savedUser) {
                if (err) {
                    return res.send(createResponse(false, {}, err.message));
                }

                return res.send(createResponse(true,
                    newUser,
                    "Create account successfully!"));
            })
        })
        .catch(function (errors) {
            console.log(errors.length);
            console.log(errors);
            return res.status(400).send(createResponse(false, null, errors[0].msg));
        });
};


// Create a list of lecturers using xlsx file
exports.createLecturersUsingXLSX = function (req, res) {


    var mailTransporter = nodemailer.createTransport(mailTransportConfig);

    // check received file
    var fileInfo = req.file;
    if (fileInfo == null || fileInfo.mimetype != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        return res.status(400).send(createResponse(false, null, "Invalid xlsx file"));
    }

    // find all offices
    Office.find(function (err, offices) {

        if (err) {
            return res.status(500).createResponse(false, null, err.message);
        }

        // get all office names

        var filterdOffices = _.filter(offices, function (office) {
            return (office.name != null);
        });

        var officeNames = _.map(filterdOffices, function (office) {
            return office.name;
        });


        // create a queue object with concurrency 2
        var q = async.queue(function (task, callback) {

            var row = task.row;

            if (row._number == 1) {
                return callback();
            }

            // File format: No., Officer Number, Full Name, Office, Username
            var values = row.values;

            // get username
            var username = values[5];
            if (username.text) {
                username = username.text;
            }

            // random password
            var password = randomstring.generate(10);

            // find best match office
            console.log("row value: " + row.values[4] + " office name: " + officeNames + " with length: " + officeNames.length);
            var bestMatchOfficeName = stringSimilarity.findBestMatch(row.values[4], officeNames).bestMatch.target;
            var indexOfBestMatchOffice = officeNames.indexOf(bestMatchOfficeName);

            // find index of best match office name in the offices array
            if (indexOfBestMatchOffice == -1) {
                var error = new Error("Internal error.");
                return callback(error, username);
            }


            // save new lecturer
            var newUser = new User({
                officerNumber: values[2],
                username: username,
                password: password,
                officeID: offices[indexOfBestMatchOffice]._id,
                fullName: values[3],
                role: 'lecturer'
            });

            newUser.save(function (err) {
                if (err) {
                    return callback(err, username);
                }

                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: '"ThesisMgr System 👥" <uendno@gmail.com>', // sender address
                    to: username, // list of receivers
                    subject: 'Invitation Mail', // Subject line
                    text: 'username: ' + username + "\n" + "password: " + password // plaintext body
                    //  html: '<b>Hello world 🐴</b>' // html body
                };

                console.log("sending mail to " + username);
                // send mail with defined transport object
                mailTransporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        return callback(error, username);
                    }

                    console.log(util.inspect(info, showHidden = false, depth = 2, colorize = true));
                    return callback();
                });
            })

        }, 2);


        var responseErrors = [];

        q.drain = function () {
            if (responseErrors.length > 0) {
                return res.status(400).send(createResponse(false, {
                        errors: responseErrors
                    },
                    "There are some errors."
                ));

            } else {
                return res.send(createResponse(true, null, "Successfully!"));
            }

        };

        // read xlsx file
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(fileInfo.path)
            .then(function () {
                var worksheet = workbook.getWorksheet("Sheet1");
                worksheet.eachRow({includeEmpty: true}, function (row, rowNumber) {

                    q.push({
                        row: row,
                        rowNumber: rowNumber
                    }, function (error, username) {
                        if (error) {
                            responseErrors.push({
                                username: username,
                                errorMessage: error.message
                            })
                        }
                    })
                })
            })
    })
};