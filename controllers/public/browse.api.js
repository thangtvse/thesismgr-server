var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;
var treeHelper = require('../../helpers/tree');
var _ = require('underscore');
var async = require('async');

/**
 * Get all lecturer in a unit. Please note that we also list all lecturers in nested units
 * @param req
 * @param res
 */
exports.getAllLecturersInAUintAPI = function (req, res) {
    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();


    req.asyncValidationErrors()
        .then(function () {

            getModel('unit').then(function (Unit) {
                Unit.findOne({
                    id: req.query.unit_id
                }).exec(function (error, unit) {
                    if (error) {
                        return res.status(400).send(createResponse(false, null, error.message));
                    }

                    if (!unit) {
                        return res.status(400).send(createResponse(false, null, "Unit not found."));
                    }

                    treeHelper.findAncestorsAndDescendantsForUnit(unit, function (error, ancestors, descendants) {
                        var opts = {
                            unit: []
                        };

                        opts.unit.push(unit.id);
                        _.forEach(descendants, function (des) {
                            opts.unit.push(des.id);
                        });


                        getModel('lecturer').then(function (Lecturer) {
                            Lecturer.getPopulatedLecturerList(req.query.page, opts, function (error, lecturers) {
                                if (error) {
                                    return res.send(createResponse(false, null, error.message));
                                }

                                return res.send(createResponse(true, lecturers, null));
                            })
                        })
                    })
                })
            })


        })
        .catch(function (errors) {
            return res.status(400).send(createResponse(false, null, errors[0].msg));
        });
};


/**
 * Get all lecturers in a field with pagination
 */
exports.getAllLecturersInAFieldAPI = function (req, res) {

    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();
    req.checkQuery('field_id', 'Invalid field ID.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('lecturer').then(function (Lecturer) {
        Lecturer.getPopulatedLecturerList(req.query.page, {
            fields: [req.query.field_id]
        }, function (error, lecturers) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, lecturers, null));
        })
    })
};

exports.getNumberOfPagesOnSearchingTopicByNameAPI = function (req, res) {
    req.checkQuery('topic_name', 'Invalid name.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('topic').then(function (Topic) {

    })
};

exports.searchLecturerByNameAPI = function (req, res) {

    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();
    req.checkQuery('full_name', 'Invalid name.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    var data = {};

    getModel('lecturer').then(function (Lecturer) {

        async.parallel([
            function (callback) {
                Lecturer.getNumberOfPagesOnSearchingLecturerByName(req.query.full_name, function (error, numberOfPages) {
                    if (error) {
                        return callback(error);
                    }

                    data.numberOfPages = numberOfPages;
                    return callback();
                })
            },
            function (callback) {
                Lecturer.getPopulatedLecturerList(req.query.page, {
                    fullName: req.query.full_name
                }, function (error, lecturers) {
                    if (error) {
                        return callback(error);
                    }

                    data.lecturers = lecturers;
                    return callback();
                })
            }
        ], function (errors) {
            if (errors && errors.length > 0) {
                return res.status(400).send(createResponse(false, null, errors[0].msg));
            }

            return res.send(createResponse(true, data, null));
        })
    })
};

exports.searchTopicByNameAPI = function (req, res) {
    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();
    req.checkQuery('topic_name', 'Invalid name.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    var data = {}

    getModel('topic').then(function (Topic) {

        async.parallel([
            function (callback) {
                Topic.getNumberOfPagesOnSearchingTopicByName(req.query.topic_name, function (error, numberOfPages) {
                    if (error) {
                        return callback(error);
                    }

                    data.numberOfPages = numberOfPages;
                    return callback();
                })
            },
            function (callback) {
                Topic.searchTopicByName(req.query.page, req.query.topic_name, function (error, topics) {
                    if (error) {
                        return callback(error);
                    }

                    data.topics = topics;
                    return callback();
                })
            }
        ], function (errors) {
            if (errors && errors.length > 0) {
                return res.status(400).send(createResponse(false, null, errors[0].msg));
            }

            return res.send(createResponse(true, data, null));
        });
    })
};