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

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('student').then(function (Student) {
        Student.getPopulatedStudentList(req.query.page, req.query.faculty_id, function (error, students) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, students, null));
        })
    })
};

// /**
//  * Search an student by officer number
//  * @param req
//  * @param res
//  * @returns {*}
//  */
// exports.searchStudentByOfficerNumberAPI = function (req, res) {
//     req.checkQuery('officer_number', 'Invalid officer number').notEmpty();
//
//     var errors = req.validationErrors();
//
//     if (errors) {
//         return res.status(400).send(createResponse(false, null, errors[0].msg));
//     }
//
//     getModel('user').then(function (User) {
//         User.find({
//             officerNumber: {
//                 'contains': req.query.officer_number
//             },
//             role: 'student'
//         })
//             .populate('faculty')
//             .populate('unit')
//             .exec(function (error, students) {
//                 if (error) {
//                     return res.send(createResponse(false, {}, error.message));
//                 }
//
//                 return res.send(createResponse(true, students, null));
//             })
//     })
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

                var errorString = "";
                _.forEach(errors, function (error) {
                    errorString = errorString.concat(error.message + "\n");
                });

                req.flash('errorMessage', 'There are some errors:\n' + errorString);
            }

            return res.redirect('/admin/users/students');
        })
    });


};

/**
 * Update student info
 * @param req
 * @param res
 * @returns {*}
 */
exports.updateStudentAPI = function (req, res) {


    req.checkBody('officer_number', 'Invalid officer number').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    var process = function () {
        var updateOpts = {
            email: req.body.email,
            faculty: req.body.faculty_id,
            course: req.body.course_id,
            program: req.body.program_id,
            fullName: req.body.full_name,
            thesisRegistrable: req.body.thesis_registrable
        };


        getModel('student').then(function (Student) {
            Student.updateInfo(req.body.officer_number, updateOpts, function (error, updatedStudent) {
                if (error) {
                    return res.status(400).send(createResponse(false, null, error.message));
                }

                return res.send(createResponse(true, updatedStudent, null));
            })
        })
    };

    if (req.user.role == "admin") {
        return process();
    } else {
        getModel("user").then(function (User) {
            User.findOne({
                officerNumber: req.body.officer_number
            }).exec(function (error, user) {
                if (error) {
                    return res.status(400).send(createResponse(false, null, error.message));
                }

                if (!user) {
                    return res.status(400).send(createResponse(false, null, "User not found."));
                }

                if (user.faculty != req.user.faculty) {
                    return res.status(400).send(createResponse(false, null, "You have no permission for editting this user."));
                }

                return process();
            })
        })
    }
};

/**
 * Enable thesis registrable for a list of students using xlsx
 * @param req
 * @param res
 */
exports.enableThesisRegistrableUsingXLSX = function (req, res) {

    // check received file
    var fileInfo = req.file;

    if (fileInfo == null || fileInfo.mimetype != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        req.flash('errorMessage', 'Invalid file type');
        return res.redirect('/admin/users/students');
    }



    getModel('student').then(function (Student) {
        Student.enableThesisRegistrableUsingXLSX(req.user.faculty, fileInfo.path, function (errors) {
            if (errors && errors.length > 0) {

                var errorString = "";
                _.forEach(errors, function (error) {
                    errorString = errorString.concat(error.message + "\n");
                });

                req.flash('errorMessage', 'There are some errors:\n' + errorString);
            }

            return res.redirect('/admin/users/students');
        })
    })
};