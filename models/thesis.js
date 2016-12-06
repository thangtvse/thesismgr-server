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

    /**
     * Move a thesis to the next status if it can be
     * @param changer
     * @param thesisID
     * @param selectionIndex
     * @param next
     */
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

    /**
     * Get number of theses with opts
     * @param page
     * @param opts
     * @param next
     */
    countPopulatedThesisList: function (page, opts, next) {
        var thesisOpts = objectUtil.compactObject({
            faculty: opts.faculty,
            id: opts.id,
            status: opts.status,
            lecturer: opts.lecturer,
            student: opts.student,
            session: opts.session
        });

        getModel('thesis').then(function (Thesis) {
            Thesis.count(thesisOpts).exec(function (error, count) {
                return next(error, count);
            })
        })
    },

    /**
     * Get a populated thesis list with opts
     * @param page
     * @param opts
     * @param next
     */
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
                .exec(getPopulatedThesisListExecFunction(next));
        })
    },

    /**
     * Get a populated thesis list without pagination
     * @param opts
     * @param next
     */
    getAllPopulatedThesisList: function (opts, next) {
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
                .exec(getPopulatedThesisListExecFunction(next))
        })
    },

    /**
     * Get number of requests for admin
     * @param page
     * @param next
     */
    countAllRequestForAdmin: function (page, next) {
        var statuses = thesisStatus.filter(function (status) {
            if (status.responder.indexOf("admin") == -1) {
                return false;
            } else {
                return true
            }
        });

        getModel('thesis').then(function (Thesis) {
            Thesis.count({
                status: statuses
            }).exec(next);
        })
    },

    /**
     * Get all requests for admin
     * @param page
     * @param next
     */
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

    /**
     * Get number of requests for moderator with a specified faculty ID
     * @param page
     * @param facultyID
     * @param next
     */
    countAllRequestForModerator: function (page, facultyID, next) {
        var statuses = thesisStatus.filter(function (status) {
            if (status.responder.indexOf("moderator") == -1) {
                return false;
            } else {
                return true
            }
        });


        getModel('thesis').then(function (Thesis) {
            return Thesis.count({
                status: statuses,
                faculty: facultyID
            }).exec(next);
        })
    },

    /**
     * Get all requests for a moderator with a specified faculty ID
     * @param page
     * @param facultyID
     * @param next
     */
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


    /**
     * Get number of requests for lecturer
     * @param page
     * @param user
     * @param next
     */
    countAllRequestForLecturer: function (page, user, next) {
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
            return Thesis.count({
                status: statuses,
                lecturer: user.lecturer[0].id
            }).exec(next);
        })
    },

    /**
     * Get all requests for a lecturer
     * @param page
     * @param user
     * @param next
     * @returns {*}
     */
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

    getAllStudentTheseForLecturer: function (page, user, next) {
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

    /**
     * Get number of requests for a student
     * @param page
     * @param user
     * @param next
     * @returns {*}
     */
    countAllRequestForStudent: function (page, user, next) {
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
            return Thesis.count(page, {
                status: statuses,
                or: {
                    lecturer: user.student[0].id
                }
            }).exec(next);
        })
    },

    /**
     * Get all requests for a student
     * @param page
     * @param user
     * @param next
     * @returns {*}
     */
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

    /**
     * Get all requests for a secretary without pagination
     * @param user
     * @param next
     * @returns {*}
     */
    getAllRequestForASecretary: function (user, next) {

        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        getModel('thesis').then(function (Thesis) {
            getModel('lecturer').then(function (Lecturer) {
                Lecturer.findOne({
                    id: user.lecturer[0].id
                })
                    .populate('councils')
                    .exec(function (error, lecturer) {
                        if (error) {
                            return next(error);
                        }

                        var resThese = [];
                        getModel('council').then(function (Council) {
                            async.forEach(lecturer.councils, function (council, callback) {

                                if (council.secretary != lecturer.id) {
                                    callback();
                                }

                                Thesis.getAllPopulatedThesisList({
                                    council: council.id
                                }).exec(function (error, theses) {
                                    if (error) {
                                        return callback(error);
                                    }

                                    resTheses.push.apply(resThese, theses);
                                })
                            })
                        })
                    })
            })
        })
    }
};


var getPopulatedThesisListExecFunction = function(next) {
    return function (error, theses) {
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
    }
};