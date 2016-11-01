/**
 * Created by Tran Viet Thang on 10/22/2016.
 */


var express = require('express');
var router = express.Router();
var authMiddleware = require('../middlewares/auth');
var expressValidator = require('express-validator');
var User = require('../models/User');
var Office = require('../models/Office');
var Field = require('../models/Field');
var customValidators = require('../helpers/customValidators');

// Exclude some paths from middleware
var unless = function (paths, middleware) {
    return function (req, res, next) {

        var shouldRunMiddleware = true;

        paths.forEach(function (path) { 
            if (req.path === path) {
                shouldRunMiddleware = false;
            }
        })

        if (shouldRunMiddleware) {
            return middleware(req, res, next);
        } else {
            return next();
        }


    };
};

// middlewares ===============================================
// authentication
router.use(unless(['/users/login'], authMiddleware));

// param validations
router.use(expressValidator({
    customValidators: customValidators
}));

// routes ============================================================
router.use('/users', require('./users'));
router.use('/fields', require('./fields'));
router.use('/offices', require('./offices'));

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', { title: 'Express' });
});

module.exports = router;
