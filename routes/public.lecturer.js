var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var LecturersCtrl = require('../controllers/public/users.lecturer');


router.get('/', [
    function (req, res) {
        res.render('./public/users/lecturer/lecturer',{
            main:"./demo.ejs",
            mainjs: "./script/demo.script.ejs",
            lecturer:lecturer
        });
    }
]);

router.get('/api/change_password', [
    hasAccess('lecturer'),
    LecturersCtrl.changePasswordAPI
]);

module.exports = router;