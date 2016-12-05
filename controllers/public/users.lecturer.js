var getModel = require('express-waterline');

/**
 * Get all lecturers with pagination
 */
exports.getAllLecturersAPI = function (req, res) {

    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('lecturer').then(function (Lecturer) {
        Lecturer.getPopulatedLecturerList(req.query.page, {faculty: req.query.faculty_id}, function (error, lecturers) {
            if (error) {
                return res.send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, lecturers, null));
        })
    })
};