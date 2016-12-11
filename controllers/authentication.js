var passport = require('passport');
var getModel = require('express-waterline').getModels;
var createResponse = require('../helpers/response').createRes;

exports.getLogin = function (req, res) {
    res.render('./public/login', {message: req.flash('loginMessage')});
};

exports.getAdminLogin = function (req, res) {
    res.render('./admin/login', {message: req.flash('loginMessage')})
};

exports.getFirstTimeChangePasswordView = function (req, res) {
    res.render('./public/partials/profile.first_time_change_password.ejs', {
        req: req,
        message: req.flash('loginMessage')
    })
};

exports.firstTimeChangePassword = function (req, res) {

    req.checkBody("new_password", "Invalid new password.").notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('user').then(function (User) {
        User.changePasswordFirstTime(req.decoded.data.officerNumber, req.body.new_password, function (error) {
            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/change-password-first-time')
            }

            return res.redirect('/profile');
        })
    })
};

