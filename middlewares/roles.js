/*
 * Project: ThesisMgr-Server
 * File: helpers\role.js
 */

var User = require('../models/User');
var createResponse = require('../helpers/response').createRes;
var util = require('util');
var roles = require('../config/roles');


exports.hasAccess = function (accessLevel) {
    return function (req, res, next) {

        if (roles[accessLevel].indexOf(req.user.role) > -1) {
            return next();
        } else {
            return res.status(403).send(createResponse(false, null, "You have no permission."))
        }

    }
};

