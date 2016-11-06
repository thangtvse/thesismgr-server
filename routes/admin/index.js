var express = require('express');
var router = express.Router();
var adminAuthCtrl = require('../../controllers/admin/authentication');
var passport = require('passport');
var authMiddleware = require('../../middlewares/auth');
var unless = require('../../helpers/auth').unless;

router.use(unless(['/login'], authMiddleware.moderatorAuth));

router.get('/', function(req, res) {
    res.render('admin/index');
});

router.get('/login', adminAuthCtrl.getLogin);

router.post('/login',  passport.authenticate('admin-login', {
    successRedirect : '/admin', // redirect to the secure profile section
    failureRedirect : '/admin/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

router.use('/users', require('./users'));

module.exports = router;