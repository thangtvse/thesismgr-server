var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;


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
        email : req.query.email,
        unit: req.query.unit,
        officerNumber: req.query.officer_number,
        fullName: req.query.full_name,

    };

    if (req.query.fields) {
        opts.fields = JSON.parse(req.query.fields)
    }

    getModel('lecturer').then(function (Lecturer) {
        Lecturer.getPopulatedLecturerList(req.query.page, {faculty: opts}, function (error, lecturers) {
            if (error) {
                return res.send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, lecturers, null));
        })
    })
};
exports.getAllThesesAPI= function (req,res) {
    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('thesis').then(function (Thesis) {
        Thesis.getAllRequestForLecturer(req.query.page,req.user,function (error,theses) {
            if (error) {
                return res.send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, theses, null));
        })
    })
}