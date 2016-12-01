var express = require('express');
var router = express.Router();
var adminAuthCtrl = require('../controllers/authentication');
var passport = require('passport');
var hasAccess = require('../middlewares/auth').hasAccess;
var expressValidator = require('express-validator');



router.get('/',[
    function (req, res) {
        res.render('./users/lecturer/lecturer');
    }
]);
router.get('/profile',[
    function (req,res) {
        res.render('./users/lecturer/lecturer.update_info.ejs');
    }
]);
router.get('/pending',[
    function (req,res) {
        res.render('./users/lecturer/lecturer.pending.ejs');
    }
]);
router.get('/accept',[
    function (req,res) {
        res.render('./users/lecturer/lecturer.accept.ejs');
    }
]);
router.get('/reject',[
    function (req,res) {
        res.render('./users/lecturer/lecturer.reject.ejs');
    }
]);
module.exports = router;