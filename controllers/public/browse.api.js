var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;
var treeHelper = require('../../helpers/tree');
var _ = require('underscore');

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
 * Get all lecturers with pagination
 */
exports.getAllLecturersAPI = function (req, res) {

    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    var opts = {
        faculty: req.query.faculty_id,
        email: req.query.email,
        unit: req.query.unit,
        officerNumber: req.query.officer_number,
        fullName: req.query.full_name,
    };

    if (req.query.fields) {
        opts.fields = JSON.parse(req.query.fields)
    }

    getModel('lecturer').then(function (Lecturer) {
        Lecturer.getPopulatedLecturerList(req.query.page, opts, function (error, lecturers) {
            if (error) {
                return res.send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, lecturers, null));
        })
    })
};