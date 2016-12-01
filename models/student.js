var getModel = require('express-waterline').getModels;
var sendMail = require('../helpers/mail').sendMail;
var _ = require('underscore');
var stringSimilarity = require('string-similarity');
var util = require('util');


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

        thesisRegistrable: {
            type: 'boolean',
            defaultsTo: false
        }
    },

    /**
     * Creaete one Student
     * @param officerNumber
     * @param email
     * @param unitID
     * @param fullName
     * @param courseID
     * @param programID
     * @param senderEmail
     * @param mailTransporter
     * @param next {function (Error, Student)}
     */
    createOne: function (officerNumber, email, unitID, fullName, courseID, programID, senderEmail, mailTransporter, next) {
        getModel('user').then(function (User) {
            User.createOne(officerNumber, email, unitID, fullName, 'student', function (error, user, originalPassword) {
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
                        return sendMail(email, originalPassword, senderEmail, mailTransporter);
                    })
                })
            })
        })
    },

    /**
     * Create a list of students by using xlsx
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

                        var courseNames = _.map(_.filter(courses, function (course) {
                            return (course.name != null);
                        }), function (course) {
                            return course.name;
                        });

                        var programNames = _.map(_.filter(programs, function (program) {
                            return (program.name != null);
                        }), function (program) {
                            return program.name;
                        });

                        if (courseNames == null || courseNames.length == 0 || programNames == null || programNames.length == 0) {
                            return next([new Error('Internal error: Lack of courses and programs.')]);
                        }

                        console.log(util.inspect(courseNames));
                        console.log(util.inspect(programNames));

                        getModel('user').then(function (User) {
                            User.createUsingXLSX('student', specifiedFaculty, filePath, function (values, user, originalPassword, callback) {
                                    getModel('student').then(function (Student) {

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
                                            course: courses[indexOfBestMatchCourse],
                                            program: programs[indexOfBestMatchProgram]
                                        }).exec(function (error, student) {
                                            if (error) {
                                                console.log(error);
                                                return next([error]);
                                            }

                                            sendMail(user.email, originalPassword, senderEmail, mailTransporter);
                                            return callback();
                                        })
                                    })
                                },
                                function (errors) {
                                    next(errors.map(function (error) {
                                        return new Error(error.msg);
                                    }));
                                })
                        })
                    })
                });
            })
        });
    }
};