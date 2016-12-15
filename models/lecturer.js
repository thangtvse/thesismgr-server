var getModel = require('express-waterline').getModels;
var sendMail = require('../helpers/mail').sendMail;
var paginationConfig = require('../config/pagination');
var async = require('async');
var _ = require('underscore');
var objectUtil = require('../helpers/object');
var slug = require('vietnamese-slug');

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

        changes: {
            collection: 'change',
            via: 'lecturer'
        },

        rank: {
            type: 'string'
        },

        fields: {
            collection: 'field',
            via: 'lecturers'
        },

        topics: {
            collection: 'topic',
            via: 'lecturer'
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


                        return sendMail(email, originalPassword, officerNumber, senderEmail, mailTransporter);
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

                            sendMail(user.email, originalPassword, user.officerNumber, senderEmail, mailTransporter);
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
     * @param opts
     * @param next
     */
    getPopulatedLecturerList: function (page, opts, next) {

        var userOpts = objectUtil.compactObject({
            email: opts.email,
            faculty: opts.faculty,
            unit: opts.unit,
            officerNumber: opts.officerNumber
        });

        if (opts.fullName) {
            userOpts.slugFullName = {
                'contains': slug(opts.fullName, ' ')
            }
        }

        userOpts.role = ['lecturer', 'moderator'];

        var lecturerOpts = objectUtil.compactObject({
            fields: opts.fields
        });

        getModel('user').then(function (User) {
            getModel('lecturer').then(function (Lecturer) {

                User.find(userOpts)
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
                                .populate('topics')
                                .exec(function (error, lecturer) {

                                    if (error) {
                                        return callback(error);
                                    }

                                    if (lecturerOpts.fields) {
                                        _.forEach(lecturer.fields, function (field) {
                                            if (lecturerOpts.fields.indexOf(field.id) != -1) {
                                                resLecturer.lecturer = _.omit(lecturer.toObject(), ['password', 'user']);
                                                resLecturers.push(resLecturer);
                                            }
                                        });
                                    } else {
                                        resLecturer.lecturer = _.omit(lecturer.toObject(), ['password', 'user']);
                                        resLecturers.push(resLecturer);
                                    }

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
    searchPopulatedLecturerByOfficerNumber: function (officerNumber, next) {
        getModel('user').then(function (User) {
            getModel('lecturer').then(function (Lecturer) {

                User.find({
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
                                .populate('topics')
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


    getPopulatedLecturerByOfficerNumber: function (officerNumber, next) {
        getModel('user').then(function (User) {
            getModel('lecturer').then(function (Lecturer) {

                User.find({
                    officerNumber: officerNumber,
                    role: ['lecturer', 'moderator']
                })
                    .sort({
                        createdAt: 'desc'
                    })
                    .populate('lecturer')
                    .populate('unit')
                    .populate('faculty')
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
                                .populate('topics')
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
     * Get number of page when searching lecturer by name
     * @param text
     * @param next
     */
    getNumberOfPagesOnSearchingLecturerByName: function (text, next) {
        getModel('user').then(function (User) {
            User.count({
                slugFullName: {
                    'contains': slug(text, ' ')
                },
                role: ['moderator', 'lecturer']
            }).exec(function (error, numberOfLecturers) {
                if (error) {
                    return next(error);
                }

                var numberOfPages;
                if (numberOfLecturers % paginationConfig.numberOfUsersPerPage == 0) {
                    numberOfPages = Math.floor(numberOfLecturers / paginationConfig.numberOfUsersPerPage);
                } else {
                    numberOfPages = Math.floor(numberOfLecturers / paginationConfig.numberOfUsersPerPage) + 1;
                }

                return next(null, numberOfPages)
            })
        })
    },

    updateProfile: function (officerNumber, opts, next) {
        var userUpdateOpts = objectUtil.compactObject({
            email: opts.email,
            unit: opts.unit,
            fullName: opts.fullName
        });

        var lecturerOpts = objectUtil.compactObject({
            fields: opts.fields,
            rank: opts.rank
        });

        getModel('user').then(function (User) {
            User.update({
                officerNumber: officerNumber,
                role: ['lecturer', 'moderator']
            }, userUpdateOpts, function (error, updated) {
                if (error) {
                    return next(error);
                }

                if (!updated) {
                    return next(new Error('Lecturer not found.'));
                }

                User.findOne({
                    officerNumber: officerNumber
                }).populate('lecturer').exec(function (error, user) {

                    if (error) {
                        return next(error);
                    }

                    if (!user.lecturer || user.lecturer.length == 0) {
                        return next(new Error('Lecturer not found.'));
                    }

                    getModel('lecturer').then(function (Lecturer) {
                        Lecturer.update({
                                id: user.lecturer[0].id
                            },
                            lecturerOpts).exec(function (error, updated) {
                            if (error) {
                                return next(error);
                            }

                            if (!updated) {
                                return next(new Error('Lecturer not found.'));
                            }

                            return next();
                        })
                    })
                })
            })
        })
    },

    /**
     * Search lecturer by name without pagination
     * @param text
     * @param next
     */
    searchLecturerByName: function (text, next) {
        getModel('user').then(function (User) {
            User.find({
                role: ["moderator", "lecturer"],
                slugFullName: {
                    'contains': text
                }
            }).exec(function (error, lecturers) {
                return next(error, lecturers)
            })
        })
    }
};