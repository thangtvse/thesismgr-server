var getModel = require('express-waterline').getModels;
var sendMail = require('../helpers/mail').sendMail;
var _ = require('underscore');
var stringSimilarity = require('string-similarity');
var util = require('util');
var paginationConfig = require('../config/pagination');
var async = require('async');
var objectUtil = require('../helpers/object');
var Excel = require('exceljs');

module.exports = {
    identity: 'student',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        user: {
            model: 'user',
            unique: true,
            required: true
        },

        course: {
            model: 'course',
            required: true
        },

        program: {
            model: 'program',
            required: true
        },

        theses: {
            collection: 'thesis',
            via: 'student'
        },

        changes: {
            collection: 'change',
            via: 'student'
        },

        thesisRegistrable: {
            type: 'boolean',
            defaultsTo: false
        }
    },

    /**
     * Creaete one Student
     * @param officerNumber
     * @param email
     * @param facultyID
     * @param fullName
     * @param courseID
     * @param programID
     * @param senderEmail
     * @param mailTransporter
     * @param next {function (Error, Student)}
     */
    createOne: function (officerNumber, email, facultyID, fullName, courseID, programID, senderEmail, mailTransporter, next) {

        getModel('course').then(function (Course) {
            Course.findOne({
                id: courseID
            }).exec(function (error, course) {

                getModel('program').then(function (Program) {
                    Program.findOne({
                        id: programID
                    }).exec(function (error, program) {

                        if (course.faculty != program.faculty || course.faculty != facultyID) {
                            return next(new Error("Faculty of unit, course and program do not match."));
                        }

                        getModel('user').then(function (User) {
                            User.createOne(officerNumber, email, facultyID, fullName, 'student', function (error, user, originalPassword) {
                                if (error) {
                                    return next(error, null);
                                }


                                getModel('student').then(function (Student) {
                                    Student.create({
                                        user: user,
                                        course: courseID,
                                        program: programID
                                    }).exec(function (error, student) {
                                        next(error, student);
                                        return sendMail(email, originalPassword, officerNumber, senderEmail, mailTransporter);
                                    })
                                })
                            })
                        })

                    })
                })
            })
        })

    },

    /**
     * Create a list of students by using xlsx. If sepcifiedFaculty is not null, all user must be in this faculty
     * @param specifiedFaculty
     * @param filePath
     * @param mailTransporter
     * @param senderEmail
     * @param next {function ([Error])}
     */
    createUsingXLSX: function (specifiedFaculty, filePath, mailTransporter, senderEmail, next) {
        getModel('course').then(function (Course) {
            Course.find().exec(function (error, courses) {
                if (error) {
                    return next([error]);
                }

                getModel('program').then(function (Program) {
                    Program.find().exec(function (error, programs) {
                        if (error) {
                            return next([error]);
                        }

                        getModel('user').then(function (User) {
                            User.createUsingXLSX('student', specifiedFaculty, filePath, function (values, user, originalPassword, callback) {
                                    getModel('student').then(function (Student) {

                                        var filteredCourses = _.filter(courses, function (course) {
                                            return (course.name != null && course.faculty == user.faculty);
                                        });

                                        var courseNames = _.map(filteredCourses, function (course) {
                                            return course.name;
                                        });

                                        var filteredPrograms = _.filter(programs, function (program) {
                                            return (program.name != null && program.faculty == user.faculty);
                                        });

                                        var programNames = _.map(filteredPrograms, function (program) {
                                            return program.name;
                                        });

                                        if (courseNames == null || courseNames.length == 0 || programNames == null || programNames.length == 0) {
                                            User.destroy(user.id).exec(function (error) {
                                                if (error) {
                                                    return callback(error);
                                                }

                                                return callback(new Error('Internal error: No course or program matches.'));
                                            });
                                        } else {
                                            if (typeof values[6] != 'string' || typeof values[7] != 'string') {
                                                return callback(new Error('File error: Wrong format!'));
                                            }

                                            var bestMatchCourseName = stringSimilarity.findBestMatch(values[6], courseNames).bestMatch.target;
                                            var indexOfBestMatchCourse = courseNames.indexOf(bestMatchCourseName);
                                            var bestMatchProgramName = stringSimilarity.findBestMatch(values[7], programNames).bestMatch.target;
                                            var indexOfBestMatchProgram = programNames.indexOf(bestMatchProgramName);

                                            console.log('Finding: ' + values[6] + ' and ' + values[7]);

                                            Student.create({
                                                user: user,
                                                course: filteredCourses[indexOfBestMatchCourse],
                                                program: filteredPrograms[indexOfBestMatchProgram]
                                            }).exec(function (error, student) {
                                                if (error) {
                                                    console.log(error);
                                                    return callback(error);
                                                }

                                                sendMail(user.email, originalPassword, user.officerNumber, senderEmail, mailTransporter);
                                                return callback();
                                            })
                                        }
                                    })
                                },
                                function (errors) {
                                    next(errors);
                                })
                        })
                    })
                });
            })
        });
    },


    /**
     * Get a list of populated students with pagination
     * @param page
     * @param facultyID
     * @param next
     */
    getPopulatedStudentList: function (page, facultyID, next) {

        var findOpts = {};
        if (facultyID != null) {
            findOpts.faculty = facultyID;
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
                        page: page,
                        limit: paginationConfig.numberOfUsersPerPage
                    })
                    .exec(function (error, users) {
                        if (error) {
                            return next(error.message);
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
                                return next(errors[0]);
                            }

                            return next(null, resStudents);
                        });
                    });
            });
        });
    },

    getPopulatedStudentByOfficerNumber: function (officerNumber, next) {
        getModel('user').then(function (User) {
            getModel('student').then(function (Student) {

                User.findOne({
                    officerNumber: officerNumber,
                    role: ['student']
                })
                    .sort({
                        createdAt: 'desc'
                    })
                    .populate('student')
                    .populate('unit')
                    .populate('faculty')
                    .exec(function (error, user) {
                        if (error) {
                            return next(error.message);
                        }

                        if (user == null) {
                            return next(new Error("User not found."));
                        }

                        if (user.student == null || user.student.length == 0) {
                            return next(new Error("There are some internal errors."));
                        }

                        var resStudent = user.toObject();

                        Student.findOne({
                            id: user.student[0].id
                        })
                            .populate('program')
                            .populate('course')
                            .exec(function (error, student) {

                                if (error) {
                                    return next(error.message);
                                }

                                resStudent.student = _.omit(student.toObject(), ['password', 'user']);

                                return next(null, resStudent);
                            });
                    });
            });
        });
    },

    /**
     * Update student info
     * @param officerNumber
     * @param updateOpts
     * @param next
     */
    updateInfo: function (officerNumber, updateOpts, next) {
        var userUpdateOpts = objectUtil.compactObject({
            email: updateOpts.email,
            faculty: updateOpts.faculty,
            unit: updateOpts.faculty,
            fullName: updateOpts.fullName
        });

        var studentUpdateOpts = objectUtil.compactObject({
            course: updateOpts.course,
            program: updateOpts.program,
            thesisRegistrable: updateOpts.thesisRegistrable
        });

        getModel('user').then(function (User) {
            getModel('student').then(function (Student) {
                User.update({
                    officerNumber: officerNumber,
                    role: ['student']
                }, userUpdateOpts)
                    .exec(function (error, updated) {
                        if (error) {
                            return next(error);
                        }

                        if (!updated) {
                            return next(new Error('Student not found.'));
                        }

                        User.findOne({
                            officerNumber: officerNumber,
                            role: ['student']
                        }).populate('student').exec(function (error, user) {
                            if (error) {
                                return next(error);
                            }

                            if (!user) {
                                return next(new Error('User not found.'));
                            }

                            Student.update({
                                id: user.student[0].id
                            }, studentUpdateOpts)
                                .exec(function (error) {

                                    if (error) {
                                        return next(error);
                                    }

                                    Student.getPopulatedStudentByOfficerNumber(officerNumber, function (error, student) {
                                        if (error) {
                                            return next(error);
                                        }

                                        if (!student) {
                                            return next(new Error("Student not found"));
                                        }

                                        return next(null, student);
                                    })

                                });
                        })
                    })
            });
        })
    },


    /**
     * Make a list of students become registrable using XLSX file. All user must be in a specified faculty. If this faculty is root unit,
     * users has not to be in any specified faculty.
     * @param specifiedFaculty
     * @param filePath
     * @param next
     */
    enableThesisRegistrableUsingXLSX: function (specifiedFaculty, filePath, next) {
        var q = async.queue(function (task, callback) {
            var row = task.row;

            if (row._number == 1) {
                return callback();
            }

            // File format: No., Officer Number,....
            var values = row.values;

            var officerNumber = values[2];

            getModel("user").then(function (User) {
                User.findOne({
                    officerNumber: "" + officerNumber,
                    role: 'student'
                })
                    .populate('student')
                    .exec(function (error, user) {
                        if (error) {
                            return callback(error);
                        }

                        if (!user) {
                            return callback(new Error("User " + officerNumber + " not found."));
                        }

                        if (specifiedFaculty.left != 1 && user.faculty != specifiedFaculty.id) {
                            return callback(new Error("You have no permission for editing user " + officerNumber));
                        }

                        user.student[0].thesisRegistrable = true;
                        user.student[0].save(function (error) {
                            if (error) {
                                return callback(error);
                            }

                            callback();
                        })
                    })
            })
        }, 20);


        var responseErrors = [];

        q.drain = function () {

            if (responseErrors.length > 0) {

                return next(responseErrors);

            } else {
                return next([]);
            }

        };

        // read xlsx file
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(filePath)
            .then(function () {
                var worksheet = workbook.getWorksheet("Sheet1");
                worksheet.eachRow({includeEmpty: false}, function (row, rowNumber) {

                    q.push({
                        row: row,
                        rowNumber: rowNumber
                    }, function (error) {
                        if (error) {
                            responseErrors.push(error);
                        }
                    })
                })
            })

    }
};