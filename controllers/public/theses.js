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
        return res.render('./public/student/theses.ejs', {
            req: req,
            message: req.flash('errorMessage')
        });
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
    getModel('field').then(function (Field) {
        Field.getAllFields(function (error, fields) {

            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/theses/new');
            }

            return res.render('./public/student/theses.new.ejs', {
                req: req,
                message: req.flash('errorMessage'),
                fields: fields
            })
        })
    })
};