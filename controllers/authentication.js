var passport = require('passport');

exports.getLogin = function (req, res) {
    res.render('./public/login', {message: req.flash('loginMessage')});
};

exports.getAdminLogin = function (req, res) {
    res.render('./admin/login', {message: req.flash('loginMessage')})
}

