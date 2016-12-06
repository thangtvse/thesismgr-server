var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var LecturersCtrl = require('../controllers/public/users.lecturer');


router.get('/', [
    function (req, res) {
        var lecturer={
            "name":"Nguyễn Văn B"
        };
        res.render('./public/users/lecturer/lecturer',{
            main:"./demo.ejs",
            mainjs: "./script/demo.script.ejs",
            lecturer:lecturer
        });
    }
]);
router.get('/profile', [
    function (req, res) {
        var lecturer={
            "name":"Nguyễn Văn B",
            "rank":"Tiến sĩ",
            "unit":"Bộ môn công nghệ phần mềm",
            "research":"Kiểm thử phần mềm",
            "subjects":["Tin học cơ sở 1","Lập trình nâng cao","Kiểm thử phần mềm"],
            "email":"abc@gmail.com",
            "avatar":"/img/250x250.png"
        };
        res.render('./public/users/lecturer/lecturer',{
            main:"./lecturer.profile.ejs",
            mainjs: "./script/demo.script.ejs",
            lecturer:lecturer
        });
    }
]);
router.get('/edit-profile', [
    function (req, res) {
        var lecturer={
            "name":"Nguyễn Văn B",
            "rank":"Tiến sĩ",
            "unit":"Bộ môn công nghệ phần mềm",
            "research":"Kiểm thử phần mềm",
            "subjects":["Tin học cơ sở 1","Lập trình nâng cao","Kiểm thử phần mềm"],
            "email":"abc@gmail.com",
            "avatar":"/img/250x250.png"
        };
        res.render('./public/users/lecturer/lecturer',{
            main:"./lecturer.edit_profile.ejs",
            mainjs: "./script/lecturer.edit_profile.script.ejs",
            lecturer:lecturer
        });
    }
]);

router.get('/resetPassword', [
    function (req, res) {
        var lecturer={
            "name":"Nguyễn Văn B",
            "rank":"Tiến sĩ",
            "unit":"Bộ môn công nghệ phần mềm",
            "research":"Kiểm thử phần mềm",
            "subjects":["Tin học cơ sở 1","Lập trình nâng cao","Kiểm thử phần mềm"],
            "email":"abc@gmail.com",
            "avatar":"/img/250x250.png"
        };
        res.render('./public/users/lecturer/lecturer',{
            main:"./lecturer.forgotPassword.ejs",
            mainjs: "./script/lecturer.forgotPassword.script.ejs",
            lecturer:lecturer
        });
    }
]);
router.get('/pending', [
    function (req, res) {
        var lecturer={
            "name":"Nguyễn Văn B"
        };
        res.render('./public/users/lecturer/lecturer',{
            main:"./lecturer.topic.ejs",
            mainjs: "./script/lecturer.topic.script.ejs",
            numberOfPages: 1,
            status: "pending",
            lecturer:lecturer
        });
    }
]);
router.get('/accept', [
    function (req, res) {
        var lecturer={
            "name":"Nguyễn Văn B"
        };
        res.render('./public/users/lecturer/lecturer',{
            main:"./lecturer.topic.ejs",
            mainjs: "./script/lecturer.topic.script.ejs",
            numberOfPages: 1,
            status: "accept",
            lecturer:lecturer
        });
    }
]);
router.get('/reject', [
    function (req, res) {
        var lecturer={
            "name":"Nguyễn Văn B"
        };
        res.render('./public/users/lecturer/lecturer',{
            main:"./lecturer.topic.ejs",
            mainjs: "./script/lecturer.topic.script.ejs",
            numberOfPages: 1,
            status: "reject",
            lecturer:lecturer
        });
    }
]);
router.get('/topic_details/:userId/:status/:id', [

    function (req, res) {
        var topic={
            name: "Nguyễn Văn A",
            id: "14020644",
            topic: "Thao tác sinh học phân tử cấp độ 1 ",
            details: "   Tạo và lai giống các sinh vât nước ngọt đang có nguy cơ bị tuyệt chủng và nghiên cứu thông tin mã di truyên của ADN trong bộ nhiễm sắc thể tôm hùm do dó có thể đảo ngược được các vấn đề của hệ thông hiện tại đó là ai thì cũng chẳng quan trọng lắm."
        };
        var lecturer={
            "name":"Nguyễn Văn B"
        };
        res.render('./public/users/lecturer/lecturer', {
            status: req.param("status"),
            lecturer:lecturer,
            topic:topic,
            main:"./lecturer.topic_details.ejs",
            mainjs:"./script/lecturer.topic-details.script.ejs"
        });
    }
]);


router.get('/api/change_password', [
    hasAccess('lecturer'),
    LecturersCtrl.changePasswordAPI
]);

module.exports = router;