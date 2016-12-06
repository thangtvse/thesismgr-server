var getModel = require('express-waterline').getModels;


exports.viewALecturer = function (req, res) {
    getModel('lecturer').then(function (Lecturer) {
        Lecturer.getPopulatedLecturerList(1, {
            officerNumber: req.params.id
        }, function (error, lecturers) {
            if (error) {
                return res.redirect('/400');
            }

            if (!lecturers || lecturers.length == 0) {
                return res.redirect('/404');
            }

            return res.render('./public/browse/lecturer_details', {
                req: req,
                lecturer: lecturers[0],
                message: req.flash("errorMessage")
            });
        })
    })
};