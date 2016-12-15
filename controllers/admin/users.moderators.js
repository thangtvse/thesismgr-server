var getModel = require('express-waterline').getModels;
var mailTransportConfig = require('../../config/mail').transportConfig;
var nodemailer = require('nodemailer');
var mailHelper = require('../../helpers/mail');
var mailConfig = require('../../config/mail');
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
                        return res.redirect('/admin/users/moderators');
                    }

                    Unit.find({
                        type: 'faculty'
                    }).exec(function (error, faculties) {

                        if (error) {
                            console.log(error);
                            req.flash('errorMessage', error.message);
                            return res.redirect('/admin/users/moderators');
                        }

                        return res.render('./admin/users/moderators', {
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
    req.checkBody('password', "Invalid password,").notEmpty();
    req.checkBody('full_name', "Invalid full name,").notEmpty();
    req.checkBody('email', "Invalid email,").notEmpty().isEmail();
    req.checkBody('faculty_id', "Invalid faculty ID,").notEmpty().isFacultyIDAvailable();


    req.asyncValidationErrors()
        .then(function () {
            getModel('user').then(function (User) {

                User.create({
                    officerNumber: req.body.officer_number,
                    fullName: req.body.full_name,
                    password: req.body.password,
                    faculty: req.body.faculty_id,
                    unit: req.body.faculty_id,
                    email: req.body.email,
                    role: 'moderator'
                }).exec(function (error) {

                    if (error) {
                        console.log(error);
                        req.flash('errorMessage', error.message);
                        return res.redirect('/admin/users/moderators');
                    }

                    var mailTransporter = nodemailer.createTransport(mailTransportConfig);
                    mailHelper.sendMailForModerator(req.body.email, req.body.password, req.body.officer_number, mailConfig.transportConfig.auth.user, mailTransporter);

                    return res.redirect('/admin/users/moderators');

                })
            })
        })
        .catch(function (errors) {
            console.log(errors);
            req.flash('errorMessage', errors[0].msg);
            return res.redirect('/admin/users/moderators');
        });
};

/**
 * Revoke moderator role from an user
 * @param req
 * @param res
 */
exports.revokeModerator = function (req, res) {
    req.checkQuery('officer_number', "Invalid officer number,").notEmpty();

    var errors = req.validationErrors();

    if (errors && errors.length > 0) {
        console.log(errors);
        req.flash('errorMessage', errors[0].msg);
        return res.redirect('/admin/users/moderators');
    }

    getModel('user').then(function (User) {
        User.destroy({
            officerNumber: req.query.officer_number
        }, function (error) {

            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/admin/users/moderators');
            }

            return res.redirect('/admin/users/moderators');
        })
    })
};
