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
    autoUpdatedAt: true,
    attributes: {
        student: {
            model: 'student',
            required: true
        },

        lecturer: {
            model: 'lecturer',
            required: true
        },

        title: {
            type: 'string',
            required: true
        },

        fields: {
            collection: 'field',
            via: 'theses'
        },

        faculty: {
            model: 'unit',
            required: true
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
            model: 'session',
            required: true
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

        if (!changer || !changer.role) {
            return next(new Error("You have no permission."))
        }

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

                var status = _.find(thesisStatus, function (item) {
                    return item.id == thesis.status
                });

                if (selectionIndex >= status.next.length) {
                    return next(new Error("Index out of range."));
                }

                switch (status.responder[selectionIndex]) {
                    case "student":
                        if (changer.role == 'student' && changer.student && changer.student[0] && changer.student[0].id == thesis.student) {
                            thesis.status = status.next[selectionIndex];
                        }
                        break;
                    case "lecturer":
                        if (changer.role == 'lecturer' && changer.lecturer && changer.lecturer[0] && changer.lecturer[0].id == thesis.lecturer) {
                            thesis.status = status.next[selectionIndex];
                        }
                        break;
                    case "moderator":
                        if (changer.role == 'moderator' && changer.faculty.id == thesis.faculty) {
                            thesis.status = status.next[selectionIndex];
                        }
                        break;
                    case "admin":
                        if (changer.role == 'admin') {
                            thesis.status = status.next[selectionIndex];
                        }
                        break;
                }

                thesis.save(function (error) {
                    return next(error, thesisStatus[thesis.status]);
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
    countPopulatedThesisList: function (opts, next) {
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
            session: opts.session,
            council: opts.council
        });

        getModel('thesis').then(function (Thesis) {
            Thesis.find(thesisOpts)
                .populate('student')
                .populate('lecturer')
                .populate('session')
                .populate('fields')
                .populate('faculty')
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
            session: opts.session,
            council: opts.council
        });

        getModel('thesis').then(function (Thesis) {
            Thesis.find(thesisOpts)
                .populate('student')
                .populate('lecturer')
                .populate('session')
                .populate('council')
                .populate('fields')
                .populate('faculty')
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
    countAllRequestForAdmin: function (next) {
        var statuses = mapStatuses(thesisStatus.filter(function (status) {
            if (status.responder.indexOf("admin") == -1) {
                return false;
            } else {
                return true
            }
        }));

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

        var statuses = mapStatuses(thesisStatus.filter(function (status) {
            if (status.responder.indexOf("admin") == -1) {
                return false;
            } else {
                return true
            }
        }));

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
    countAllRequestForModerator: function (facultyID, next) {
        var statuses = mapStatuses(thesisStatus.filter(function (status) {
            if (status.responder.indexOf("moderator") == -1) {
                return false;
            } else {
                return true
            }
        }));


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

        var statuses = mapStatuses(thesisStatus.filter(function (status) {
            if (status.responder.indexOf("moderator") == -1) {
                return false;
            } else {
                return true
            }
        }));


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
    countAllRequestForLecturer: function (user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        var statuses = mapStatuses(thesisStatus.filter(function (status) {
            if (status.responder.indexOf("lecturer") == -1 || status.responder.indexOf("secretary") == -1) {
                return false;
            } else {
                return true
            }
        }));

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

        var statuses = mapStatuses(thesisStatus.filter(function (status) {
            if (status.responder.indexOf("lecturer") != -1 || status.responder.indexOf("secretary") != -1) {
                return true;
            } else {
                return false
            }
        }));

        getModel('thesis').then(function (Thesis) {
            return Thesis.getPopulatedThesisList(page, {
                status: statuses,
                lecturer: user.lecturer[0].id
            }, next);
        })
    },

    /**
     * Get number of all student these of a lecturer
     * @param user
     * @param next
     * @returns {*}
     */
    countAllStudentTheseForLecturer: function (user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        getModel('thesis').then(function (Thesis) {
            return Thesis.count({
                lecturer: user.lecturer[0].id
            }, next);
        })
    },

    /**
     * Get all student these for a lecturer
     * @param page
     * @param user
     * @param next
     * @returns {*}
     */
    getAllStudentTheseForLecturer: function (page, user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        getModel('thesis').then(function (Thesis) {
            return Thesis.getPopulatedThesisList(page, {
                lecturer: user.lecturer[0].id
            }, next);
        })
    },

    /**
     * Get number of denied these by a lecturer
     * @param user
     * @param next
     * @returns {*}
     */
    countAllDeniedStudentTheseForLecturer: function (user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        getModel('thesis').then(function (Thesis) {
            return Thesis.count({
                lecturer: user.lecturer[0].id,
                status: 2
            }, next);
        })
    },

    /**
     * GEt all denied these by a lecturer
     * @param page
     * @param user
     * @param next
     * @returns {*}
     */
    getAllDeniedStudentTheseForLecturer: function (page, user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        getModel('thesis').then(function (Thesis) {
            return Thesis.getPopulatedThesisList(page, {
                status: 2,
                lecturer: user.lecturer[0].id
            }, next);
        })
    },

    /**
     * Get number of these that being guided by a lecturer
     * @param user
     * @param next
     */
    countAllGuidingTheseForLecturer: function (user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        var statuses = mapStatuses(thesisStatus.filter(function (status) {
            if ([1, 2, 7, 8, 19].indexOf(status.id) != -1) {
                return false;
            } else {
                return true
            }
        }));

        getModel('thesis').then(function (Thesis) {
            return Thesis.count({
                status: statuses,
                lecturer: user.lecturer[0].id
            }).exec(next);
        })
    },

    /**
     * Get all these taht being guided by a lecturer
     * @param page
     * @param user
     * @param next
     */
    getAllGuidingTheseForLecturer: function (page, user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        var statuses = mapStatuses(thesisStatus.filter(function (status) {
            if ([1, 2, 7, 8, 19].indexOf(status.id) != -1) {
                return false;
            } else {
                return true
            }
        }));

        getModel('thesis').then(function (Thesis) {
            return Thesis.getPopulatedThesisList(page, {
                status: statuses,
                lecturer: user.lecturer[0].id
            }, next);
        })
    },

    /**
     * Get all completed student these of a lecturer
     * @param page
     * @param user
     * @param next
     * @returns {*}
     */
    getAllCompletedStudentTheseForLecturer: function (page, user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        getModel('thesis').then(function (Thesis) {
            return Thesis.getPopulatedThesisList(page, {
                status: 19,
                lecturer: user.lecturer[0].id
            }, next);
        })
    },

    /**
     * Get number of all completed student these of a lecturer
     * @param user
     * @param next
     * @returns {*}
     */
    countAllCompletedStudentTheseForLecturer: function (user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        getModel('thesis').then(function (Thesis) {
            return Thesis.count({
                status: 19,
                lecturer: user.lecturer[0].id
            }).exec(next);
        })
    },


    /**
     * Get all completed student these of a lecturer
     * @param page
     * @param user
     * @param next
     * @returns {*}
     */
    getAllStoppedStudentTheseForLecturer: function (page, user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        getModel('thesis').then(function (Thesis) {
            return Thesis.getPopulatedThesisList(page, {
                status: 8,
                lecturer: user.lecturer[0].id
            }, next);
        })
    },

    /**
     * Get number of all completed student these of a lecturer
     * @param user
     * @param next
     * @returns {*}
     */
    countAllStoppedStudentTheseForLecturer: function (user, next) {
        if (!user.lecturer || user.lecturer.length == 0) {
            return next(new Error("This user is not a lecturer."));
        }

        getModel('thesis').then(function (Thesis) {
            return Thesis.count({
                status: 8,
                lecturer: user.lecturer[0].id
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
    getAllRequestForStudent: function (user, next) {


        if (!user.student || user.student.length == 0) {
            return next(new Error("This user is not a student."));
        }

        var statuses = mapStatuses(thesisStatus.filter(function (status) {
            if (status.responder.indexOf("student") == -1) {
                return false;
            } else {
                return true
            }
        }));

        getModel('thesis').then(function (Thesis) {
            return Thesis.getAllPopulatedThesisList({
                status: statuses,
                student: user.student[0].id
            }, next);
        })
    },

    getAllThesisForStudent: function (user, next) {
        if (!user.student || user.student.length == 0) {
            return next(new Error("This user is not a student."));
        }

        getModel('thesis').then(function (Thesis) {
            return Thesis.getAllPopulatedThesisList({
                student: user.student[0].id
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

                        var resTheses = [];
                        getModel('council').then(function (Council) {
                            async.forEach(lecturer.councils, function (council, callback) {

                                if (council.secretary != lecturer.id) {
                                    return callback();
                                }

                                Thesis.getAllPopulatedThesisList({
                                    council: council.id
                                }, function (error, theses) {
                                    if (error) {
                                        return callback(error);
                                    }

                                    resTheses.push.apply(resTheses, theses);
                                    return callback();
                                });
                            }, function (errors) {
                                if (errors && errors.length >0) {
                                    return next(errors[0]);
                                }

                                return next(null, resTheses);
                            })
                        })
                    })
            })
        })
    },


    /**
     * Get all accepted these in a faculty
     * @param facultyID
     * @param next
     */
    getAllAcceptedTheseInAFaculty: function (facultyID, next) {

        getModel('user').then(function (User) {
            getModel('thesis').then(function (Thesis) {
                Thesis.find({
                    status: 4,
                    faculty: facultyID
                })
                    .populate('lecturer')
                    .populate('student')
                    .exec(function (error, theses) {
                        if (error) {
                            return next(error);
                        }

                        var resTheses = [];

                        async.forEach(theses, function (thesis, forCallback) {
                            var resThesis = thesis.toObject();

                            async.paralell([
                                function (callback) {
                                    User.findOne({
                                            id: thesis.lecturer.user
                                        }
                                    ).exec(function (error, user) {
                                        if (error) {
                                            return callback(error);
                                        }

                                        resThesis.lecturer.user = user.toString();
                                    })
                                },
                                function (callback) {
                                    User.findOne({
                                        id: thesis.student.user
                                    })
                                        .populate('unit')
                                        .exec(function (error, user) {
                                            if (error) {
                                                return callback(error);
                                            }

                                            resThesis.student.user = user.toString();

                                        })
                                }
                            ], function (errors) {
                                if (errors && errors.length) {
                                    return forCallback(errors[0]);
                                }

                                resTheses.push(resThesis);
                            })

                        }, function (errors) {
                            if (errors && errors.length) {
                                return next(errors[0]);
                            }
                        })

                    })
            })
        });

    },

    /**
     * Get thesis details by id
     * @param id
     * @param next
     */
    getThesisDetails: function (id, next) {
        getModel('thesis').then(function (Thesis) {
            Thesis.findOne({
                id: id
            })
                .populate('student')
                .populate('lecturer')
                .populate('session')
                .populate('council')
                .populate('fields')
                .populate('faculty')
                .exec(function (error, thesis) {

                    if (error) {
                        return next(error);
                    }

                    if (!thesis) {
                        return next(new Error("Thesis not found."));
                    }

                    var resThesis = thesis.toObject();

                    async.parallel([
                        function (callback) {
                            getModel('student').then(function (Student) {
                                Student.findOne({
                                    id: thesis.student.id
                                })
                                    .populate('user')
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
                                })
                                    .populate('user')
                                    .exec(function (error, result) {
                                        if (error) {
                                            return callback(error);
                                        }
                                        resThesis.lecturer = result;
                                        return callback();
                                    })
                            })
                        },
                        function (callback) {

                            if (thesis.council) {
                                getModel('council').then(function (Council) {
                                    Council.getPopulatedCouncil(thesis.council.id, function (error, council) {
                                        if (error) {
                                            return callback(error);
                                        }

                                        resThesis.council = council;
                                        return callback();
                                    })
                                })
                            } else {
                                callback();
                            }
                        }
                    ], function (errors) {
                        if (errors && errors.length > 0) {
                            return next(errors[0]);
                        }

                        resThesis.status = _.find(thesisStatus, function (status) {
                            return status.id == resThesis.status;
                        });

                        return next(null, resThesis);
                    })
                })
        })
    }
};


var getPopulatedThesisListExecFunction = function (next) {
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

                resThesis.status = _.find(thesisStatus, function (status) {
                    return status.id == resThesis.status;
                });

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

var mapStatuses = function (statuses) {
    return _.map(statuses, function (status) {
        return status.id;
    })
};