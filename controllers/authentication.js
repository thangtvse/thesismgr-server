var passport = require('passport');

exports.getLogin = function (req, res) {
    res.render('login',{ message: req.flash('loginMessage')});
};

exports.postLogin = function (req, res) {
    req.checkBody('username', 'Invalid username').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        console.log(errors);

        return req.flash('loginMessage', errors[0].msg);
    }

    passport.authenticate('admin-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    })
};

