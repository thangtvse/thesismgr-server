/**
 * Created by Tran Viet Thang on 10/22/2016.
 */

var authConfig = require('../config/auth');
var jwt = require('jsonwebtoken');
var util = require('util')

module.exports = function (req, res, next) {
    //middleware for authorization

    //get token from body or header
    var token = req.query.token || req.headers['token'] || req.body.token;
    if (token) {

        //verifies secret and check exp
        jwt.verify(token, authConfig.secret_key, function (err, decoded) {
            if (err) {
                console.log(err);
                return res.status(401).send({
                    success: false,
                    message: err.message
                });
            } else {
                // if everything is good, save to request for use in other routes
            
                req.user = decoded._doc;
                console.log('JWT decoded:\n' + util.inspect(decoded, {showHidden: false, depth: null}))
                return next();
            }
        })
    } else {

        //there is no token
        return res.status(401).send({
            success: false,
            message: "No token provided"
        })
    }
};