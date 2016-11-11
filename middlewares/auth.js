/**
 * Created by Tran Viet Thang on 10/22/2016.
 */

var roles = require('../config/roles');

exports.hasAccess = function (accessLevel) {
    return function (req, res, next) {

        if (req.isAuthenticated() && roles[accessLevel].indexOf(req.user.role) > -1) {
            return next();
        } else {
            return res.redirect('/login');
        }

    }
};

exports.adminAuth = function (req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && req.user.role == 'admin')
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
};

exports.moderatorAuth = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && (req.user.role == 'moderator' || req.user.role == 'admin'))
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
};

exports.moderatorLevelAuth = function (req, res, next) {

};


exports.lecturerAuth = function (req, res, next) {

};

exports.studentAuth = function (req, res, next) {

};