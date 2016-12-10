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

            getModel('topic').then(function (Topic) {
                Topic.find({
                    lecturer: lecturers[0].lecturer.id
                })
                    .sort({
                        createdAt: 'desc'
                    })
                    .populate('fields')
                    .exec(function (error, results) {
                        if (error) {
                            return res.redirect('/400');
                        }

                        return res.render('./public/browse/lecturer_details.ejs', {
                            req: req,
                            profile: lecturers[0],
                            topics: results,
                            message: req.flash("errorMessage")
                        });
                    })
            });



        })
    })
};

exports.getView = function (req, res) {
    return res.render('./public/browse/lecturers', {
        req: req,
        message: req.flash("errorMessage")
    })
};
