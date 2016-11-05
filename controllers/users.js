/*
 * Project: ThesisMgr-Server
 * File: controllers\users.js
 */

var User = require('../models/User');
var Office = require('../models/Office');
var jwt = require('jsonwebtoken');
var createResponse = require('../helpers/response').createRes;
var authConfig = require('../config/auth');
var bcrypt = require('bcrypt-nodejs');
var _ = require('underscore');
var randomstring = require("randomstring");
var Excel = require('exceljs');
var stringSimilarity = require('string-similarity');

/**
 * Login controller
 */
exports.login = function (req, res) {

    req.checkBody('username', 'Invalid username').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    User.login(req.body.username, req.body.password, function (err, result, user) {

        if (err) {
            return res.status(401).send(createResponse(false, null, err.message));
        }

        if (result == true) {
            // if user is found and password is right
            // create a token
            var token = jwt.sign(user, authConfig.secret_key, {
                expiresIn: authConfig.exp_time
            });

            // return the information including token as JSON
            return res.send({
                success: true,
                message: "Enjoy your token!",
                token: token,
                user: _.omit(user.toObject(), 'password')
            });
        } else {
            return res.status(401).send(createResponse(false, null, "Wrong password."));
        }
    })
}

// get a lecturer or student user by id
exports.getUserByID = function (req, res) {

    var id = req.params.id;
    User.findOne(
        {
            _id: id,
            role: {
                $in: ['lecturer', 'student']
            }
        },
        function (err, user) {
            if (err) {
                return res.send(createResponse(false, {}, err.message));
            }

            return res.send(createResponse(true, nil, _.omit(user.toObject(), 'password')));
        });
}

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

            return res.send(createResponse(true, nil, _.omit(user.toObject(), 'password')));
        });
}


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
}


// Create a list of lecturers using xlsx file
exports.createLecturersUsingXLSX = function (req, res) {

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
        var officeNames = _map(offices, function (office) {
            return office.name;
        })

        // read xlsx file
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(fileInfo.path)
            .then(function () {
                var worksheet = workbook.getWorksheet("Sheet1");
                worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {

                    // File format: No., Officer Number, Full Name, Office, Username
                    var values = row.values;

                    // find best match office
                    var bestMatchOfficeName = stringSimilarity.findBestMatch(row.values[4]).bestMatch.target;
                    var indexOfBestMatchOffice = officeNames.indexOf(bestMatchOfficeName);

                    // find index of best match office name in the offices array
                    if (indexOfBestMatchOffice = -1) {
                        return res.status(500).createResponse(false, null, "Internal error.");
                    }

                    // save new lecturer
                    var newUser = new User({
                        officerNumber: values[2],
                        username: values[5],
                        password: randomstring.generate(10),
                        officeID: offices[indexOfBestMatchOffice]._id,
                        fullName: values[2],
                        role: 'lecturer'
                    });

                    newUser.save(function (err) {
                        if (err) {
                            return res.status(500).createResponse(false, null, err.message);
                        }
                    })
                })
            })
            .catch(function (err) {
                if (err) {
                    return res.status(500).createResponse(false, null, err.message);
                }
            });
    })

    res.send(req.file);
}