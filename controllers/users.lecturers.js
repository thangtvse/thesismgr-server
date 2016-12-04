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
var getModel = require('express-waterline').getModels;
var numberOfUsersPerPage = require('../config/pagination').numberOfUsersPerPage;
var randomstring = require('randomstring');
var paginationConfig = require('../config/pagination');
var authHelper = require('../helpers/auth');
var async = require('async');

/**
 * Get /users/lecturers page
 * @param req
 * @param res
 */
exports.getLecturerListPage = function (req, res) {
    getModel('lecturer').then(function (Lecturer) {
        Lecturer.count().exec(function (error, numOfLecturers) {
            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/users/lecturers');
            }

            getModel('unit').then(function (Unit) {
                Unit.find().exec(function (error, units) {
                    if (error) {
                        req.flash('errorMessage', error.message);
                        return res.redirect('/users/lecturers');
                    }

                    var filteredUnits = units.filter(function (unit) {
                        if (unit.left == 1) {
                            return false
                        } else {
                            return true
                        }
                    });

                    var numberOfPages;
                    if (numOfLecturers % paginationConfig.numberOfUsersPerPage == 0) {
                        numberOfPages = Math.floor(numOfLecturers / paginationConfig.numberOfUsersPerPage);
                    } else {
                        numberOfPages = Math.floor(numOfLecturers / paginationConfig.numberOfUsersPerPage) + 1;
                    }

                    res.render('./users/lecturers', {
                        req: req,
                        units: _.map(filteredUnits, function (unit) {
                            return unit.toObject();
                        }),
                        numberOfPages: numberOfPages,
                        numberOfUsersPerPage: paginationConfig.numberOfUsersPerPage,
                        message: req.flash('errorMessage')
                    })
                })
            })
        })
    });
};

/**
 * Get all lecturers with pagination
 */
exports.getAllLecturersAPI = function (req, res) {

    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var findOpts = {
        role: ['moderator', 'lecturer']
    };
    if (req.query.faculty_id) {
        findOpts.faculty = req.query.faculty_id
    }

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('user').then(function (User) {
        getModel('lecturer').then(function (Lecturer) {

            User.find(findOpts)
                .sort({
                    createdAt: 'desc'
                })
                .populate('lecturer')
                .populate('unit')
                .populate('faculty')
                .paginate({
                    page: req.query.page,
                    limit: numberOfUsersPerPage
                })
                .exec(function (error, users) {
                    if (error) {
                        return res.send(createResponse(false, {}, error.message));
                    }

                    console.log("USERS: " + util.inspect(users));

                    var resLecturers = [];

                    async.forEachSeries(users, function (user, callback) {

                        if (user.lecturer == null || user.lecturer.length == 0) {
                            return callback();
                        }

                        var resLecturer = user.toObject();

                        Lecturer.findOne({
                            id: user.lecturer[0].id
                        })
                            .populate('fields')
                            .exec(function (error, lecturer) {

                                if (error) {
                                    return callback(error);
                                }

                                resLecturer.lecturer = _.omit(lecturer.toObject(), ['password', 'user']);

                                resLecturers.push(resLecturer);
                                return callback();
                            });
                    }, function (errors) {
                        if (errors && errors.length > 0) {
                            return res.status(400).send(createResponse(false, null, errors[0].msg));
                        }

                        return res.send(createResponse(true, resLecturers, null));
                    });
                });
        });
    });
};

/**
 * Search an lecturer by officer number
 * @param req
 * @param res
 * @returns {*}
 */
exports.searchLecturerByOfficerNumberAPI = function (req, res) {
    req.checkQuery('officer_number', 'Invalid officer number').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('user').then(function (User) {
        User.find({
            officerNumber: {
                'contains': req.query.officer_number
            },
            role: 'lecturer'
        })
            .populate('faculty')
            .populate('unit')
            .exec(function (error, lecturers) {
                if (error) {
                    return res.send(createResponse(false, {}, error.message));
                }

                return res.send(createResponse(true, lecturers, null));
            })
    })
};

// /**
//  * Get an user by id and role
//  * @param role: role of user
//  */
// exports.getUserByID = function (role) {
//     return function (req, res) {
//         getModel('user').then(function (User) {
//             var id = req.params.id;
//             User.findOne(
//                 {
//                     id: id,
//                     role: role
//                 })
//                 .populate('fields')
//                 .populate('unit')
//                 .exec(function (err, user) {
//                     if (err) {
//                         return res.send(createResponse(false, {}, err.message));
//                     }
//
//                     return res.send(createResponse(true, null, _.omit(user.toObject(), 'password')));
//                 });
//         });
//
//     }
// };

/**
 * Create a Lecturer
 */
exports.createLecturer = function (req, res) {

    console.log(util.inspect(req.body));

    // validation
    req.checkBody('officer_number', 'Invalid officer number.').notEmpty().isOfficerNumberAvailable();
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('email', 'Email taken').isEmailAvailable();
    req.checkBody('unit_id', 'Invalid unit ID').notEmpty().isUnitIDAvailable();
    req.checkBody('full_name', 'Invalid full name').notEmpty();

    req.asyncValidationErrors()
        .then(function () {

            // create user
            authHelper.checkUnitForProcess(req, res, req.body.unit_id, function (req, res) {
                var officerNumber = req.body.officer_number;
                var email = req.body.email;
                var unitID = req.body.unit_id;
                var fullName = req.body.full_name;


                getModel('lecturer').then(function (Lecturer) {
                    var mailTransporter = nodemailer.createTransport(mailTransportConfig);
                    Lecturer.createOne(officerNumber, email, unitID, fullName, 'uendno@gmail.com', mailTransporter, function (error, newLecturer) {

                        if (error) {
                            req.flash('errorMessage', error.message);
                        }

                        return res.redirect('/users/lecturers');
                    })
                })
            });
        })
        .catch(function (errors) {
            req.flash('errorMessage', errors[0].msg);
            return res.redirect('/users/lecturers');
        });
};


/**
 * Create a list of lecturer using xlsx
 * @returns {*}
 */
exports.createUsingXLSX = function (req, res) {
    var mailTransporter = nodemailer.createTransport(mailTransportConfig);

    // check received file
    var fileInfo = req.file;

    console.log(fileInfo);

    if (fileInfo == null || fileInfo.mimetype != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        req.flash('errorMessage', 'Invalid file type');
        return res.redirect('/users/lecturers');
    }


    getModel('lecturer').then(function (Lecturer) {
        Lecturer.createUsingXLSX(req.user.faculty, fileInfo.path, mailTransporter, 'uendno@gmail.com', function (errors) {

            // delete file
            fs.unlink(fileInfo.path, function (err) {
                if (err) {
                    console.log(err);
                }
            });

            if (errors && errors.length > 0) {

                console.log("CreateXLSX ERROR: ");
                errors.forEach(function (error) {
                    console.log(error.message);
                });

                req.flash('errorMessage', 'There are some error: ' + errors.map(function (error) {
                        return error.message;
                    }).toString());
                // return res.status(500).send(createResponse(false, errors, 'There are some error.'));
            }

            return res.redirect('/users/lecturers');
        })
    });


};