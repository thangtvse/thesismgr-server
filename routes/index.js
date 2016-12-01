var express = require('express');
var router = express.Router();
var adminAuthCtrl = require('../controllers/authentication');
var passport = require('passport');
var hasAccess = require('../middlewares/auth').hasAccess;
var expressValidator = require('express-validator');

router.use(expressValidator({
    customValidators: require('../helpers/customValidators')
}));

router.get('/', [
    hasAccess('moderator'),
    function (req, res) {
        res.render('index');
    }
]);

router.get('/login', adminAuthCtrl.getLogin);

router.post('/login', passport.authenticate('admin-login', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

router.use('/users', require('./users'));
router.use('/categories', require('./categories'));
router.use("/lec",require('./lecturer.demo'));
module.exports = router;