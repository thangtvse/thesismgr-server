var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;

router.get("/",[
   function (req,res) {
       res.render("./public/users/student/student.ejs");
   }
]);

module.exports = router;