/**
 * Created by Tran Viet Thang on 10/22/2016.
 */

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