var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;
var async = require('async');
var paginationConfig = require('../../config/pagination');

exports.getView = function (req, res) {
    var findOpts = {};
    if (req.user.role != 'admin') {
        findOpts = {
            faculty: req.user.faculty.id
        }
    }

    var numberOfPages = 0;
    var faculties;
    var fields;

    async.parallel([
        function (callback) {
            getModel('thesis').then(function (Thesis) {
                Thesis.count(findOpts).exec(function (error, numberOfTheses) {
                    if (error) {
                        return callback(error);
                    }

                    if (numberOfTheses % paginationConfig.numberOfUsersPerPage == 0) {
                        numberOfPages = Math.floor(numberOfTheses / paginationConfig.numberOfUsersPerPage);
                    } else {
                        numberOfPages = Math.floor(numberOfTheses / paginationConfig.numberOfUsersPerPage) + 1;
                    }

                    return callback();
                });
            });
        },
        function (callback) {
            getModel('unit').then(function (Unit) {
                Unit.getAllFaculty(function (error, results) {
                    if (error) {
                        return callback(error);
                    }

                    faculties = results;
                    callback();
                })
            })
        },
        function (callback) {
            getModel('field').then(function (Field) {
                Field.getAllFields(function (error, result) {
                    if (error) {
                        return callback(error);
                    }

                    fields = result;
                    callback();
                })
            })
        }
    ], function (errors) {
        if (errors && errors.length > 0) {
            req.flash('errorMessage', errors[0].message);
            return res.redirect('/admin/theses/theses');
        }

        return res.render('./admin/theses/theses', {
            req: req,
            faculties: faculties,
            fields: fields,
            numberOfPages: numberOfPages,
            numberOfThesesPerPage: paginationConfig.numberOfUsersPerPage,
            message: req.flash('errorMessage')
        })

    });
};

exports.getAllThesesAPI = function (req, res) {
    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    var opts = {};

    if (req.user.role == 'moderator') {
        opts.faculty = req.user.faculty;
    }

    getModel('thesis').then(function (Thesis) {
        Thesis.getPopulatedThesisList(req.query.page, opts, function (error, theses) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.sendFile(createResponse(true, theses, null));
        })
    })
};