var express = require('express');
var router = express.Router();
var adminAuthCtrl = require('../controllers/authentication');
var passport = require('passport');
var hasAccess = require('../middlewares/auth').hasAccess;

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

router.use('/fields', require('./fields'));
router.use('/offices', require('./offices'));
router.use('/users', require('./users'));

module.exports = router;