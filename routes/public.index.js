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
// LOGIN SESSION=====================================================
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

/**
 * Đăng xuất
 */
router.get('/logout',function (req,res) {
    hasAccess('public');
    req.logout();
    req.session.destroy();
    res.render('./public/login',{
        'message':{}
    });
});

/**
 * API lấy về giảng viên trong một đơn ị
 */
router.get('/api/get_lecturers_in_unit', [
    hasAccess('public'),
    BrowseAPICtrl.getAllLecturersInAUintAPI
]);

/**
 * API lấy về giảng viên theo lĩnh vực nghiên cứu
 */
router.get('/api/get_lecturers_in_field', [
    hasAccess('public'),
    BrowseAPICtrl.getAllLecturersInAFieldAPI
]);

/**
 * API Tìm giảng viên theo tên
 */
router.get('/api/search-lecturer', [
    hasAccess('public'),
    BrowseAPICtrl.searchLecturerByNameAPI
]);

/**
 * API tìm chủ đề nghiên cứu
 */
router.get('/api/search-topic', [
    hasAccess('public'),
    BrowseAPICtrl.searchTopicByNameAPI
]);

/**
 * API tìm danh giảng viên theo tên, không phân trang
 */
router.get('/api/search-lecturer-fast', [
    hasAccess('public'),
    BrowseAPICtrl.searchLecturerByNameNoPaginationAPI
]);

/**
 * View đổi mật khẩu lần đầu
 */
router.get('/change-password-first-time', [
    jwtAuth,
    authCtrl.getFirstTimeChangePasswordView
]);

/**
 * Đổi mật khẩu lần đầu
 */
router.post('/change-password-first-time', [
    jwtAuth,
    authCtrl.firstTimeChangePassword
]);

/**
 * Sub-router cho các đơn vị
 */
router.use('/units', require('./public.browse.units'));

/**
 * Sub-router cho các lĩnh vực
 */
router.use('/fields', require('./public.browse.fields'));

/**
 * Sub-router cho các giảng viên
 */
router.use('/lecturers', require('./public.browse.lecturers'));

router.use('/home', [
    hasAccess('public'),
    function (req, res) {
        res.render('./public/index', {req: req});
    }
]);

/**
 * Sub-router cho profile
 */
router.use('/profile', require('./public.profile'));

/**
 * Sub-router cho khóa luận
 */
router.use('/theses', require('./public.theses'));


module.exports = router;