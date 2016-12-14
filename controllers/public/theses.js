var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;
var async = require('async');
var util = require('util');
var paginationConfig = require('../../config/pagination');

exports.getView = function (req, res) {
    if (req.user.role == 'lecturer' || req.user.role == 'moderator') {
        getModel('thesis').then(function (Thesis) {

            Thesis.countAllStudentTheseForLecturer(req.user, function (error, numberOfThese) {
                if (error) {
                    req.flash('errorMessage', error.message);
                    return res.redirect('/theses');
                }

                var numberOfPages;
                if (numberOfThese % paginationConfig.numberOfUsersPerPage == 0) {
                    numberOfPages = Math.floor(numberOfThese / paginationConfig.numberOfUsersPerPage);
                } else {
                    numberOfPages = Math.floor(numberOfThese / paginationConfig.numberOfUsersPerPage) + 1;
                }

                return res.render('./public/lecturer/theses.ejs', {
                    req: req,
                    message: req.flash('errorMessage'),
                    numberOfPages: numberOfPages
                });
            })
        });
    } else {
        getModel('thesis').then(function (Thesis) {
            Thesis.getAllThesisForStudent(req.user, function (error, theses) {
                if (error) {
                    req.flash('errorMessage', error.message);
                    return res.redirect('/theses');
                }

                return res.render('./public/student/theses.ejs', {
                    req: req,
                    message: req.flash('errorMessage'),
                    theses: theses
                });
            })
        })
    }
};

exports.getAllTheseAPI = function (req, res) {

    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();
    req.checkQuery('status', 'Invalid status.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    if (req.user.role == 'lecturer' || req.user.role == 'moderator') {

        var process = function (error, theses) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, theses, null));
        };

        getModel('thesis').then(function (Thesis) {
            switch (req.query.status) {
                case 'guiding':
                    return Thesis.getAllGuidingTheseForLecturer(req.query.page, req.user, process);
                case 'pending':
                    return Thesis.getAllRequestForLecturer(req.query.page, req.user, process);
                case 'denied':
                    return Thesis.getAllDeniedStudentTheseForLecturer(req.query.page, req.user, process);
                case 'completed':
                    return Thesis.getAllCompletedStudentTheseForLecturer(req.query.page, req.user, process);
                case 'stopped':
                    return Thesis.getAllStoppedStudentTheseForLecturer(req.query.page, req.user, process);
                default:
                    return Thesis.getAllStudentTheseForLecturer(req.query.page, req.user, process);
            }
        });
    } else {
        getModel('thesis').then(function (Thesis) {
            Thesis.getAllThesisForStudent(req.user, function (error, theses) {
                if (error) {
                    return res.status(400).send(createResponse(false, null, error.message));
                }

                return res.send(createResponse(true, theses, null));
            })
        })
    }
};

exports.getNumberOfPagesAPI = function (req, res) {
    req.checkQuery('status', 'Invalid status.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    if (req.user.role == 'lecturer' || req.user.role == 'moderator') {

        var process = function (error, numberOfTheses) {
            if (error) {
                return res.status(400).send(createResponse(false, numberOfTheses, error.message));
            }

            return res.send(createResponse(true, numberOfTheses, null));
        };

        getModel('thesis').then(function (Thesis) {
            switch (req.query.status) {
                case 'guiding':
                    return Thesis.countAllGuidingTheseForLecturer(req.user, process);
                case 'pending':
                    return Thesis.countAllRequestForLecturer(req.user, process);
                case 'denied':
                    return Thesis.countAllDeniedStudentTheseForLecturer(req.user, process);
                case 'completed':
                    return Thesis.countAllCompletedStudentTheseForLecturer(req.user, process);
                case 'stopped':
                    return Thesis.countAllStoppedStudentTheseForLecturer(req.user, process);
                default:
                    return Thesis.countAllStudentTheseForLecturer(req.user, process);
            }
        });
    } else {
        return res.status(400).send(createResponse(false, null, "You have no permission."));
    }
};

exports.getNewThesisView = function (req, res) {

    if (req.user.student[0].thesisRegistrable == false) {
        req.flash('errorMessage', 'You are not able to register a new thesis.');
        return res.redirect('/theses')
    }

    var fields;
    var sessions;

    async.parallel([
        function (callback) {
            getModel('field').then(function (Field) {
                Field.getAllFields(function (error, results) {

                    if (error) {
                        return callback(error);
                    }

                    fields = results;
                    return callback();
                })
            })
        },
        function (callback) {
            getModel('session').then(function (Session) {
                Session.getAllAvailableSessions(function (error, results) {
                    sessions = results;
                    return callback();
                })
            })
        }
    ], function (errors) {
        if (errors && errors.length > 0) {
            req.flash('errorMessage', errors[0].message);
            return res.redirect('/theses/new');
        }

        return res.render('./public/student/theses.new.ejs', {
            req: req,
            fields: fields,
            sessions: sessions,
            message: req.flash('errorMessage')
        })
    });

};

exports.newThesisAPI = function (req, res) {

    if (req.user.student[0].thesisRegistrable == false) {
        return res.status(400).send(createResponse(false, null, 'You are not able to register a new thesis.'))
    }


    if (req.body.fields == '') {
        delete req.body.fields;
    }

    req.checkBody('title', 'Invalid status.').notEmpty();
    req.checkBody('fields', 'Invalid fields.').optional().isFieldArrayStringAvailable();
    req.checkBody('tutor_id', 'Invalid status.').notEmpty();
    req.checkBody('description', 'Invalid description.').notEmpty();
    req.checkBody('session_id', 'Invalid session ID.').notEmpty().isSessionIDAvailable();

    req.asyncValidationErrors()
        .then(function () {

            getModel('user').then(function (User) {
                User.findOne({
                    officerNumber: req.body.tutor_id,
                    role: ['moderator', 'lecturer']
                })
                    .populate('lecturer')
                    .exec(function (error, user) {

                        if (error) {
                            return res.status(400).send(createResponse(false, null, error.message));
                        }

                        if (!user) {
                            return res.status(400).send(createResponse(false, null, "Lecturer not found"))
                        }

                        getModel('thesis').then(function (Thesis) {
                            Thesis.create({
                                title: req.body.title,
                                session: req.body.session_id,
                                fields: JSON.parse(req.body.fields),
                                student: req.user.student[0].id,
                                lecturer: user.lecturer[0].id,
                                faculty: req.user.faculty,
                                description: req.body.description,
                                status: 1
                            }).exec(function (error) {
                                if (error) {
                                    return res.status(400).send(createResponse(false, null, error.message));
                                }

                                return res.send(createResponse(true, null, null));
                            })
                        })
                    })
            })

        })
        .catch(function (errors) {
            return res.status(400).send(createResponse(false, null, errors[0].msg));
        });
};

exports.getThesisDetailsView = function (req, res) {
    if (!req.params.id) {
        return res.redirect('/404');
    }

    getModel('thesis').then(function (Thesis) {
        Thesis.getThesisDetails(req.params.id, function (error, thesis) {
            if (error) {
                return res.redirect('/404');
            }

            if (!thesis) {
                return res.redirect('/404');
            }

            return res.render('./public/partials/thesis-details.ejs', {
                req: req,
                message: req.flash('errorMessage'),
                thesis: thesis
            })
        })
    })
};

exports.moveThesisToNextStatusAPI = function (req, res) {
    req.checkQuery('index', 'Invalid selection index.').notEmpty().isInt();
    req.checkQuery('thesis_id', 'Invalid thesis id.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('thesis').then(function (Thesis) {
        Thesis.moveToNextStatus(req.user, req.query.thesis_id, req.query.index, function (error, status) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, status, null));
        })
    })
};