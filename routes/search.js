var express = require('express');
var router = express.Router();
var adminAuthCtrl = require('../controllers/authentication');
var passport = require('passport');
var hasAccess = require('../middlewares/auth').hasAccess;
var expressValidator = require('express-validator');
var filterCtrl = require('../controllers/categories.users.js');


router.get("/",[
    function (req,res) {
        res.render("./search/search.ejs");
    }
]);
router.get("/a",[
    filterCtrl.getView()
]);
module.exports=router;