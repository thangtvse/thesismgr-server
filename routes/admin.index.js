var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var Passport = require('passport').Passport,
    passport = new Passport();
var session = require('express-session');
var authCtrl = require('../controllers/authentication');

// ===========================================================
// LOGIN =====================================================
// ===========================================================
router.use(session({
    secret: 'thesismgr-admin', // session secret
    resave: false,
    saveUninitialized: false,
}));
router.use(passport.initialize());
router.use(passport.session()); // persistent login sessions
require('../config/passport')(passport);
router.get('/login', authCtrl.getAdminLogin);
router.post('/login', passport.authenticate('admin-login', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login',
    failureFlash: true
}));


router.get('/', [
    hasAccess('moderator'),
    function (req, res) {
        res.render('./admin/index', {
            req: req
        });
    }
]);

router.use('/users', require('./admin.users'));
router.use('/categories', require('./admin.categories'));
router.use('/theses', require('./admin.theses'));

module.exports = router;