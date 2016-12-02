/*
 * Project: ThesisMgr-Server
 * File: controllers\users.js
 */
var createResponse = require('../../helpers/response').createRes;
var bcrypt = require('bcrypt-nodejs');
var _ = require('underscore');
var nodemailer = require('nodemailer');
var mailTransportConfig = require('../../config/mail').transportConfig;
var fs = require('fs');
var util = require('util');
var getModel = require('express-waterline').getModels;
var numberOfUsersPerPage = require('../../config/pagination').numberOfUsersPerPage;
var randomstring = require('randomstring');
var paginationConfig = require('../../config/pagination');
var authHelper = require('../../helpers/auth');
var async = require('async');

/**
 * Get /users/students page
 * @param req
 * @param res
 */
exports.getStudentListPage = function (req, res) {
    getModel('student').then(function (Student) {
        Student.count().exec(function (error, numOfStudents) {
            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/admin/users/students');
            }

            getModel('unit').then(function (Unit) {
                getModel('course').then(function (Course) {
                    getModel('program').then(function (Program) {
                        Unit.find(
                            {
                                type: 'faculty'
                            }
                        ).exec(function (error, units) {
                            if (error) {
                                req.flash('errorMessage', error.message);
                                return res.redirect('/admin/users/students');
                            }

                            var filteredUnits = units.filter(function (unit) {
                                if (unit.left == 1) {
                                    return false;
                                } else {
                                    return true;
                                }
                            });

                            if (req.user.role == 'moderator') {
                                var filteredUnits = filteredUnits.filter(function (unit) {
                                    if (unit.id == req.user.faculty.id) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                });
                            }

                            Course.find().exec(function (error, courses) {
                                if (error) {
                                    req.flash('errorMessage', error.message);
                                    return res.redirect('/admin/users/students');
                                }

                                Program.find().exec(function (error, programs) {
                                    if (error) {
                                        req.flash('errorMessage', error.message);
                                        return res.redirect('/admin/users/students');
                                    }

                                    var numberOfPages;
                                    if (numOfStudents % paginationConfig.numberOfUsersPerPage == 0) {
                                        numberOfPages = Math.floor(numOfStudents / paginationConfig.numberOfUsersPerPage);
                                    } else {
                                        numberOfPages = Math.floor(numOfStudents / paginationConfig.numberOfUsersPerPage) + 1;
                                    }

                                    res.render('./admin/users/students', {
                                        req: req,
                                        faculties: _.map(filteredUnits, function (unit) {
                                            return unit.toObject();
                                        }),
                                        courses: _.map(courses, function (course) {
                                            return course.toObject();
                                        }),
                                        programs: _.map(programs, function (program) {
                                            return program.toObject();
                                        }),
                                        numberOfPages: numberOfPages,
                                        numberOfUsersPerPage: paginationConfig.numberOfUsersPerPage,
                                        message: req.flash('errorMessage')
                                    })

                                });

                            });
                        })
                    })
                });
            })
        })
    });
};

/**
 * Get all students with pagination
 */
exports.getAllStudentsAPI = function (req, res) {

    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var findOpts = {
        role: ['moderator', 'student']
    };
    if (req.query.faculty_id) {
        findOpts.faculty = req.query.faculty_id
    }

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('user').then(function (User) {
        getModel('student').then(function (Student) {

            User.find(findOpts)
                .sort({
                    createdAt: 'desc'
                })
                .populate('student')
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

                    var resStudents = [];

                    async.forEachSeries(users, function (user, callback) {

                        if (user.student == null || user.student.length == 0) {
                            return callback();
                        }

                        var resStudent = user.toObject();

                        Student.findOne({
                            id: user.student[0].id
                        })
                            .populate('program')
                            .populate('course')
                            .exec(function (error, student) {

                                if (error) {
                                    return callback(error);
                                }

                                resStudent.student = _.omit(student.toObject(), ['password', 'user']);

                                resStudents.push(resStudent);
                                return callback();
                            });
                    }, function (errors) {
                        if (errors && errors.length > 0) {
                            return res.status(400).send(createResponse(false, null, errors[0].msg));
                        }

                        return res.send(createResponse(true, resStudents, null));
                    });
                });
        });
    });
};

/**
 * Search an student by officer number
 * @param req
 * @param res
 * @returns {*}
 */
exports.searchStudentByOfficerNumberAPI = function (req, res) {
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
            role: 'student'
        })
            .populate('faculty')
            .populate('unit')
            .exec(function (error, students) {
                if (error) {
                    return res.send(createResponse(false, {}, error.message));
                }

                return res.send(createResponse(true, students, null));
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
 * Create a Student
 */
exports.createStudent = function (req, res) {

    console.log(util.inspect(req.body));

    // validation
    req.checkBody('officer_number', 'Invalid officer number.').notEmpty().isOfficerNumberAvailable();
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('email', 'Email taken').isEmailAvailable();
    req.checkBody('unit_id', 'Invalid unit ID').notEmpty().isUnitIDAvailable();
    req.checkBody('course_id', 'Invalid course ID').notEmpty();
    req.checkBody('program_id', 'Invalid program ID').notEmpty();
    req.checkBody('full_name', 'Invalid full name').notEmpty();

    req.asyncValidationErrors()
        .then(function () {

            // create user
            authHelper.checkUnitForProcess(req, res, req.body.unit_id, function (req, res) {
                var officerNumber = req.body.officer_number;
                var email = req.body.email;
                var unitID = req.body.unit_id;
                var fullName = req.body.full_name;
                var programID = req.body.program_id;
                var courseID = req.body.course_id;

                getModel('student').then(function (Student) {
                    var mailTransporter = nodemailer.createTransport(mailTransportConfig);
                    Student.createOne(officerNumber, email, unitID, fullName, courseID, programID, 'uendno@gmail.com', mailTransporter, function (error, newStudent) {

                        if (error) {
                            req.flash('errorMessage', error.message);
                        }

                        return res.redirect('/admin/users/students');
                    })
                })
            });
        })
        .catch(function (errors) {
            req.flash('errorMessage', errors[0].msg);
            return res.redirect('/admin/users/students');
        });
};

/**
 * Create a list of student using xlsx
 * @returns {*}
 */
exports.createUsingXLSX = function (req, res) {
    var mailTransporter = nodemailer.createTransport(mailTransportConfig);

    // check received file
    var fileInfo = req.file;

    console.log(fileInfo);

    if (fileInfo == null || fileInfo.mimetype != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        req.flash('errorMessage', 'Invalid file type');
        return res.redirect('/admin/users/students');
    }


    getModel('student').then(function (Student) {
        Student.createUsingXLSX(req.user.faculty, fileInfo.path, mailTransporter, 'uendno@gmail.com', function (errors) {

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

            return res.redirect('/admin/users/students');
        })
    });


};