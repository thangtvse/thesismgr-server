var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;
var async = require('async');
var paginationConfig = require('../../config/pagination');
var docGenHelper = require('../../helpers/gendoc');

/**
 * Lấy về view quản lí các khóa luận
 * @param req
 * @param res
 */
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
                Unit.getAllFaculties(function (error, results) {
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

/**
 * API lấy về các khóa luận
 * @param req
 * @param res
 * @returns {*}
 */
exports.getAllThesesAPI = function (req, res) {
    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    var opts = {};

    if (req.user.role == 'moderator') {
        opts.faculty = req.user.faculty.id;
    }

    getModel('thesis').then(function (Thesis) {
        Thesis.getPopulatedThesisList(req.query.page, opts, function (error, theses) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, theses, null));
        })
    })
};

/**
 * Export biên bản buộc dừng khóa luận
 * @param req
 * @param res
 * @returns {*}
 */
exports.exportStopRequestDocAPI = function (req, res) {

    req.checkQuery('thesis_id', 'Invalid thesis ID').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }


    getModel('thesis').then(function (Thesis) {
        Thesis.getThesisDetails(req.query.thesis_id, function (error, thesis) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            if (thesis.status.id != 7) {
                return res.status(400).send(createResponse(false, null, "This thesis is not able for doing this task."));
            }

            docGenHelper.genStopThesisList(thesis, function (error, buffer) {
                if (error) {
                    return res.status(400).send(createResponse(false, null, error.message));
                }

                res.writeHead(200, {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Length': buffer.byteLength
                });
                res.write(buffer);
                res.end();

            })

        })
    })
};