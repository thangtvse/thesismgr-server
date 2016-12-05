var getModel = require('express-waterline').getModels;
var thesisStatus = require('../config/thesisStatus');
var async = require('async');
var objectUtil = require('../helpers/object');
var paginationConfig = require('../config/pagination');
var _ = require('underscore');

module.exports = {
    identity: 'thesis',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        student: {
            model: 'student',
            required: true
        },

        lecturer: {
            model: 'lecturer',
            required: true
        },

        topic: {
            type: 'string',
            required: true
        },

        fields: {
            collection: 'field',
            via: 'lecturers'
        },

        description: {
            type: 'text',
            required: true
        },

        status: {
            type: 'integer',
            min: 1,
            max: 19,
            required: true
        },

        files: {
            collection: 'file',
            via: 'thesis'
        },

        session: {
            model: 'session'
        },

        council: {
            model: 'council'
        },

        dateOfProtection: {
            type: 'date'
        },

        comments: {
            collection: 'comment',
            via: 'thesis'
        },

        result: {
            type: 'float'
        },

        editingExplanations: {
            collection: 'editingExplanation',
            via: 'thesis'
        }
    },

    moveToNextStatus: function (changer, thesisID, selectionIndex, next) {
        getModel('thesis').then(function (Thesis) {
            Thesis.findOne({
                id: thesisID
            }).exec(function (error, thesis) {
                if (error) {
                    return next(error);
                }

                if (!thesis) {
                    return next(new Error("Thesis not found."))
                }

                var status = thesisStatus[thesis.status];

                switch (status.responder) {
                    case "student":
                        if (changer.students && changer.students[0] && changer.students[0].id == thesis.student) {
                            thesis.status = status.next[selectionIndex];
                        }
                        break;
                    case "lecturer":
                        if (changer.lecturers && changer.lecturers[0] && changer.lecturers[0].id == thesis.lecturer) {
                            thesis.status = status.next[selectionIndex];
                        }
                        break;
                    case "moderator":
                        if (changer.faculty == thesis.faculty) {
                            thesis.status = status.next[selectionIndex];
                        }
                        break;
                    case "admin":
                        thesis.status = status.next[selectionIndex];
                        break;
                }

                thesis.save(function (error) {
                    next(error);
                })
            })
        })
    },

    getPopulatedThesisList: function (page, opts, next) {
        var thesisOpts = objectUtil.compactObject({
            faculty: opts.faculty,
            id: opts.id,
            status: opts.status,
            lecturer: opts.lecturer,
            student: opts.student,
            session: opts.session
        });

        getModel('thesis').then(function (Thesis) {
            Thesis.find(thesisOpts)
                .populate('student')
                .populate('lecturer')
                .populate('session')
                .populate('council')
                .sort({
                    createdAt: 'desc'
                })
                .paginate({
                    page: page,
                    limit: paginationConfig.numberOfUsersPerPage
                })
                .exec(function (error, theses) {

                    var resTheses = [];

                    async.forEachSeries(theses, function (thesis, callback) {

                        var resThesis = thesis.toObject();

                        async.parallel([
                            function (callback) {
                                getModel('student').then(function (Student) {
                                    Student.findOne({
                                        id: thesis.student.id
                                    }).populate('user')
                                        .exec(function (error, result) {
                                            if (error) {
                                                return callback(error);
                                            }
                                            resThesis.student = result;
                                            return callback();
                                        })
                                })
                            },
                            function (callback) {
                                getModel('lecturer').then(function (Lecturer) {
                                    Lecturer.findOne({
                                        id: thesis.lecturer.id
                                    }).populate('user')
                                        .exec(function (error, result) {
                                            if (error) {
                                                return callback(error);
                                            }
                                            resThesis.lecturer = result;
                                            return callback();
                                        })
                                })
                            }
                        ], function (errors) {
                            if (errors && errors.length > 0) {
                                return callback(errors[0]);
                            }

                            resTheses.push(resThesis);
                            return callback();
                        })
                    }, function (errors) {
                        if (errors && errors.length > 0) {
                            return next(errors[0]);
                        }

                        return next(null, resTheses);
                    });

                })
        })
    },

    getAllRequestForAdmin: function (page, next) {

        var statuses = thesisStatus.filter(function (status) {
            if (status.responder.indexOf("admin") == -1) {
                return false;
            } else {
                return true
            }
        });

        getModel('thesis').then(function (Thesis) {
            return Thesis.getPopulatedThesisList(page, {
                status: statuses
            }, next);
        })
    },

    getAllRequestForModerator: function (page, facultyID, next) {

        var statuses = thesisStatus.filter(function (status) {
            if (status.responder.indexOf("moderator") == -1) {
                return false;
            } else {
                return true
            }
        });


        getModel('thesis').then(function (Thesis) {
            return Thesis.getPopulatedThesisList(page, {
                status: statuses,
                faculty: facultyID
            }, next);
        })
    },

    getAllRequestForLecturer: function (page, user, next) {

        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        var statuses = thesisStatus.filter(function (status) {
            if (status.responder.indexOf("lecturer") == -1 || status.responder.indexOf("secretary") == -1) {
                return false;
            } else {
                return true
            }
        });

        getModel('thesis').then(function (Thesis) {
            return Thesis.getPopulatedThesisList(page, {
                status: statuses,
                lecturer: user.lecturer[0].id
            }, next);
        })
    },

    getAllRequestForStudent: function (page, user, next) {


        if (!user.student || user.student.length == 0) {
            return next(new Error("This user is not a student."));
        }

        var statuses = thesisStatus.filter(function (status) {
            if (status.responder.indexOf("student") == -1) {
                return false;
            } else {
                return true
            }
        });

        getModel('thesis').then(function (Thesis) {
            return Thesis.getPopulatedThesisList(page, {
                status: statuses,
                or: {
                    lecturer: user.student[0].id
                }
            }, next);
        })
    },

    getAllRequestForASecretary: function (page, user, next) {

        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        getModel('lecturer').then(function (Lecturer) {
            Lecturer.findOne({
                id: user.lecturer[0].id
            })
                .populate('councils')
                .exec(function (error, councils) {
                    if (error) {
                        return next(error);
                    }

                    var resThese = [];
                    getModel('council').then(function (Council) {
                        async.forEach(councils, function (council, callback) {
                            Council.findOne({
                                id: council.id
                            }).populate('theses')
                        })
                    })

                })
        })
    }
};