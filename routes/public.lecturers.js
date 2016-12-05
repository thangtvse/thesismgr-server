var express = require('express');
var router = express.Router();
var adminAuthCtrl = require('../controllers/authentication');
var passport = require('passport');
var hasAccess = require('../middlewares/auth').hasAccess;
var expressValidator = require('express-validator');



router.get('/',[
    function (req, res) {
        res.render('./public/users/lecturer/lecturer');
    }
]);
router.get('/profile',[
    function (req,res) {
        res.render('./public/users/lecturer/lecturer.profile.ejs');
    }
]);
router.get('/edit-profile',[
    function (req,res) {
        res.render('./public/users/lecturer/lecturer.edit_profile.ejs');
    }
]);

router.get('/resetPassword',[
    function (req,res) {
        res.render('./public/users/lecturer/lecturer.forgotPassword.ejs');
    }
]);
router.get('/pending',[
    function (req,res) {
        res.render('./public/users/lecturer/lecturer.pending.ejs');
    }
]);
router.get('/accept',[
    function (req,res) {
        res.render('./public/users/lecturer/lecturer.accept.ejs');
    }
]);
router.get('/reject',[
    function (req,res) {
        res.render('./public/users/lecturer/lecturer.reject.ejs');
    }
]);
router.get('/topic_details/:userId/:status/:id',[
    function (req,res) {
        res.render('./public/users/lecturer/lecturer.topic_details.ejs',{
            name:"Nguyễn Văn A",
            id:"14020644",
            topic:"Thao tác sinh học phân tử cấp độ 1 ",
            details:"   Tạo và lai giống các sinh vât nước ngọt đang có nguy cơ bị tuyệt chủng và nghiên cứu thông tin mã di truyên của ADN trong bộ nhiễm sắc thể tôm hùm do dó có thể đảo ngược được các vấn đề của hệ thông hiện tại đó là ai thì cũng chẳng quan trọng lắm.",
            status: req.param("status")
        });
    }
]);
module.exports = router;