var getModel = require('express-waterline').getModels;
var sendMail = require('../helpers/mail').sendMail;
var paginationConfig = require('../config/pagination');
var async = require('async');
var _ = require('underscore');

module.exports = {
    identity: 'lecturer',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        user: {
            model: 'user',
            unique: true,
            required: true
        },

        studentTheses: {
            collection: 'thesis',
            via: 'lecturer'
        },

        fields: {
            collection: 'field'
        },

        councils: {
            collection: 'council',
            via: 'members'
        }
    },

    /**
     * Creaete one Lecturer
     * @param officerNumber
     * @param email
     * @param unitID
     * @param fullName
     * @param senderEmail
     * @param mailTransporter
     * @param next {function (Error, Lecturer)}
     */
    createOne: function (officerNumber, email, unitID, fullName, senderEmail, mailTransporter, next) {
        getModel('user').then(function (User) {
            User.createOne(officerNumber, email, unitID, fullName, 'lecturer', function (error, user, originalPassword) {

                if (error) {
                    return next(error);
                }

                getModel('lecturer').then(function (Lecturer) {
                    Lecturer.create({
                        user: user
                    }).exec(function (error, lecturer) {
                        next(error, lecturer);


                        return sendMail(email, originalPassword, senderEmail, mailTransporter);
                    })
                })
            })
        })
    },

    /**
     * Create a list of lecturers by using xlsx
     * @param specifiedFaculty
     * @param filePath
     * @param mailTransporter
     * @param senderEmail
     * @param next {function ([Error])}
     */
    createUsingXLSX: function (specifiedFaculty, filePath, mailTransporter, senderEmail, next) {

        getModel('user').then(function (User) {
            User.createUsingXLSX('lecturer', specifiedFaculty, filePath, function (values, user, originalPassword, callback) {
                    getModel('lecturer').then(function (Lecturer) {
                        Lecturer.create({
                            user: user
                        }).exec(function (error, lecturer) {
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
                    next(errors);
                })
        })
    },

    /**
     * Get a list of populated lecturers with pagination
     * @param page
     * @param facultyID
     * @param next
     */
    getPopulatedLecturerList: function (page, facultyID, next) {

        var findOpts = {};
        if (facultyID != null) {
            findOpts.faculty = facultyID;
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
                        page: page,
                        limit: paginationConfig.numberOfUsersPerPage
                    })
                    .exec(function (error, users) {
                        if (error) {
                           return next(error);
                        }

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
                                return next(errors[0]);
                            }

                           return next(null, resLecturers);
                        });
                    });
            });
        });
    },

    /**
     * Get a populated lecturers by id
     * @param officerNumber
     * @param next
     */
    getPopulatedLecturerByOfficerNumber: function (officerNumber, next) {
        getModel('user').then(function (User) {
            getModel('lecturer').then(function (Lecturer) {

                User.findOne({
                    officerNumber: officerNumber,
                    role: ['lecturer', 'moderator']
                })
                    .sort({
                        createdAt: 'desc'
                    })
                    .populate('lecturer')
                    .populate('unit')
                    .populate('faculty')
                    .exec(function (error, user) {
                        if (error) {
                            return next(error.message);
                        }

                        if (user == null) {
                            return next("User not found.");
                        }

                        if (user.lecturer == null || user.lecturer.length == 0) {
                            return next("There are some internal errors.");
                        }

                        var resLecturer = user.toObject();

                        Lecturer.findOne({
                            id: user.lecturer[0].id
                        })
                            .populate('fields')
                            .exec(function (error, lecturer) {

                                if (error) {
                                    return next(error.message);
                                }

                                resLecturer.lecturer = _.omit(lecturer.toObject(), ['password', 'user']);

                                return next(null, resLecturer);
                            });
                    });
            });
        });
    },

    /**
     * Get a populated lecturers by id
     * @param officerNumber
     * @param next
     */
    searchPopulatedLecturerByOfficerNumber: function (officerNumber, next) {
        getModel('user').then(function (User) {
            getModel('lecturer').then(function (Lecturer) {

                User.findOne({
                    officerNumber: {
                        'contains': officerNumber
                    },
                    role: ['lecturer', 'moderator']
                })
                    .sort({
                        createdAt: 'desc'
                    })
                    .populate('lecturer')
                    .populate('unit')
                    .populate('faculty')
                    .exec(function (error, user) {
                        if (error) {
                            return next(error.message);
                        }

                        if (user == null) {
                            return next("User not found.");
                        }

                        if (user.lecturer == null || user.lecturer.length == 0) {
                            return next("There are some internal errors.");
                        }

                        var resLecturer = user.toObject();

                        Lecturer.findOne({
                            id: user.lecturer[0].id
                        })
                            .populate('fields')
                            .exec(function (error, lecturer) {

                                if (error) {
                                    return next(error.message);
                                }

                                resLecturer.lecturer = _.omit(lecturer.toObject(), ['password', 'user']);

                                return next(null, resLecturer);
                            });
                    });
            });
        });
    }
};