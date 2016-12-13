var express = require('express');
var router = express.Router();
var navMiddleware = require('../middlewares/nav');
var BrowseAPICtrl = require('../controllers/public/browse.api');
var hasAccess = require('../middlewares/auth').hasAccess;
var Passport = require('passport').Passport,
    passport = new Passport();
var session = require('express-session');
var authCtrl = require('../controllers/authentication');
var jwtAuth = require('../middlewares/auth').jwtAuth;

/**
 * Middleware for getting units and fields tree
 */
// ===========================================================
// LOGIN =====================================================
// ===========================================================
router.use(session({
    secret: require('../config/auth').passportPublicLoginSecret, // session secret
    resave: false,
    saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session()); // persistent login sessions
require('../config/passport')(passport);
router.get('/login', authCtrl.getLogin);
router.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}));


router.get('/api/get_lecturers_in_unit', [
    hasAccess('public'),
    BrowseAPICtrl.getAllLecturersInAUintAPI
]);

router.get('/api/get_lecturers_in_field', [
    hasAccess('public'),
    BrowseAPICtrl.getAllLecturersInAFieldAPI
]);

router.get('/api/search-lecturer', [
    hasAccess('public'),
    BrowseAPICtrl.searchLecturerByNameAPI
]);

router.get('/api/search-topic', [
    hasAccess('public'),
    BrowseAPICtrl.searchTopicByNameAPI
]);

router.get('/change-password-first-time', [
    jwtAuth,
    authCtrl.getFirstTimeChangePasswordView
]);

router.post('/change-password-first-time', [
    jwtAuth,
    authCtrl.firstTimeChangePassword
]);

router.use('/units', require('./public.browse.units'));
router.use('/fields', require('./public.browse.fields'));
router.use('/lecturers', require('./public.browse.lecturers'));
router.use('/home', [
    hasAccess('public'),
    function (req, res) {
        res.render('./public/index', {req: req});
    }
]);
router.use('/profile', require('./public.profile'));
router.use('/theses', require('./public.theses'));


module.exports = router;