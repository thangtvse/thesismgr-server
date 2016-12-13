var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;

router.get("/",[
   function (req,res) {
       res.render("./public/student/student.ejs");
   }
]);

router.get("/create",[
   function (req,res) {
       res.render("./public/student/student.createthesis.ejs");
   }
]);
module.exports = router;