var passport = require('passport');

exports.getLogin = function (req, res) {

    res.render('login',{ message: req.flash('loginMessage')});
};

exports.postLogin = function (req, res) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();

    console.log(req);

    var errors = req.validationErrors();
    if (errors) {
        console.log(errors);

        req.flash('loginMessage', errors[0].msg);
        return res.redirect('/login');
    }

    passport.authenticate('admin-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    })
};

