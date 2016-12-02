var express = require('express');
var router = express.Router();
var passport = require('passport');
var session = require('express-session');
var adminAuthCtrl = require('../controllers/authentication');
var passport = require('passport');
var hasAccess = require('../middlewares/auth').hasAccess;

router.use(session({
    secret: 'thesismgr-system-uet-vnu', // session secret
    resave: true,
    saveUninitialized: true
}));
router.use(passport.initialize());
router.use(passport.session()); // persistent login sessions
require('../config/passport')(passport);

router.get('/', [
    hasAccess('moderator'),
    function (req, res) {
        res.render('index', {
            req: req
        });
    }
]);

router.get('/login', adminAuthCtrl.getLogin);

router.post('/login', passport.authenticate('admin-login', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));


router.use('/users', require('./admin.users'));
router.use('/categories', require('./admin.categories'));

module.exports = router;