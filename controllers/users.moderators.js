var getModel = require('express-waterline').getModels;

/**
 * Get a view for a list of moderators
 * @param req
 * @param res
 */
exports.getView = function (req, res) {
    getModel('user').then(function (User) {
        getModel('unit').then(function (Unit) {
            User.find({
                role: 'moderator'
            })
                .populate('unit')
                .populate('faculty')
                .exec(function (error, moderators) {
                    if (error) {
                        console.log(error);
                        req.flash('errorMessage', error.message);
                        return res.redirect('/users/moderators');
                    }

                    Unit.find({
                        type: 'faculty'
                    }).exec(function (error, faculties) {

                        if (error) {
                            console.log(error);
                            req.flash('errorMessage', error.message);
                            return res.redirect('/users/moderators');
                        }

                        return res.render('./users/moderators', {
                            message: req.flash('errorMessage'),
                            moderators: moderators,
                            faculties: faculties,
                            req: req
                        })
                    });

                });
        });
    })
};

/**
 * Give moderator role to an user
 * @param req
 * @param res
 */
exports.assignModerator = function (req, res) {
    req.checkBody('officer_number', "Invalid officer number,").notEmpty();

    var errors = req.validationErrors();

    if (errors && errors.length > 0) {
        console.log(errors);
        req.flash('errorMessage', errors[0].msg);
        return res.redirect('/users/moderators');
    }
    getModel('user').then(function (User) {

        User.findOne({
            officerNumber: req.body.officer_number
        }).exec(function (error, user) {
            if (user.role == "moderator" || user.role == "admin") {
                req.flash('errorMessage', "Can't not assign this user.");
                return res.redirect('/users/moderators');
            }

            if (user.role != 'lecturer') {
                req.flash('errorMessage', "Can't not assign this user");
                return res.redirect('/users/moderators');
            }

            user.role = 'moderator';
            user.save(function (error) {
                if (error) {
                    console.log(error);
                    req.flash('errorMessage', error.message);
                }

                return res.redirect('/users/moderators');
            })

        })
    })
};

/**
 * Revoke moderator role from an user
 * @param req
 * @param res
 */
exports.revokeModerator = function (req, res) {
    req.checkBody('officer_number', "Invalid officer number,").notEmpty();

    var errors = req.validationErrors();

    if (errors && errors.length > 0) {
        console.log(errors);
        req.flash('errorMessage', errors[0].msg);
        return res.redirect('/users/moderators');
    }

    getModel('user', function (User) {
        User.findOne({
            officerNumber: req.body.officer_number
        }).exec(function (error, user) {

            if (user.role != 'moderator') {
                req.flash('errorMessage', "Can't not assign this user");
                return res.redirect('/users/moderators');
            }

            user.role = 'lecturer';
            user.save(function (error) {
                if (error) {
                    console.log(error);
                    req.flash('errorMessage', error.message);
                }

                return res.redirect('/users/moderators');
            })
        })
    })
};
