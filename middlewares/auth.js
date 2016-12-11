/**
 * Created by Tran Viet Thang on 10/22/2016.
 */

var roles = require('../config/roles');
var jwt = require('jsonwebtoken');
var authConfig = require('../config/auth');
var createResponse = require('../helpers/response').createRes;

exports.hasAccess = function (accessLevel) {
    return function (req, res, next) {

        var redirectUrl;

        if (accessLevel == 'student' || accessLevel == 'lecturer' || accessLevel == 'public') {
            redirectUrl = '/login';
        } else {
            redirectUrl = '/admin/login';
        }


        if (req.isAuthenticated() && roles[accessLevel].indexOf(req.user.role) > -1) {
            return next();
        } else {
            return res.redirect(redirectUrl);
        }

    }
};

exports.jwtAuth = function (req, res, next) {

    var token = req.query.token || req.body.token;

    jwt.verify(token, authConfig.jwtSecret, function (error, decoded) {
        if (error) {
            return res.status(400).send(createResponse(false, null, error.message));
        }

        req.decoded = decoded;
        next();
    })
};