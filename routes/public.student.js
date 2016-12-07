var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;

router.get("/",[
   function (req,res) {
       res.render("./public/users/student/student.ejs",{
           main:'./script/blank.ejs',
           mainjs:'./script/blank.ejs'
       });
   }
]);

router.get("/create",[
   function (req,res) {
       res.render("./public/users/student/student.ejs",{
           main: "./student.createthesis.ejs",
           mainjs: "./script/student.createthesis.script.ejs"
       });
   }
]);
module.exports = router;