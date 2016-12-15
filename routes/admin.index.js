var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var Passport = require('passport').Passport,
    passport = new Passport();
var session = require('express-session');
var authCtrl = require('../controllers/authentication');

// ===========================================================
// LOGIN SESSION=====================================================
// ===========================================================
router.use(session({
    secret: require('../config/auth').passportAdminLoginSecret, // session secret
    resave: false,
    saveUninitialized: false
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

/**
 * Đăng xuất
 */
router.get('/logout',function (req,res) {
    hasAccess('moderator');
    req.logout();
    req.session.destroy();
    res.render('./admin/login',{
        'message':{}
    });
});

/**
 * Trang index
 */
router.get('/', [
    hasAccess('moderator'),
    function (req, res) {
        res.render('./admin/index', {
            req: req
        });
    }
]);

/// Quản lí người dùng
router.use('/users', require('./admin.users'));

/// Quản lí các đơn vị, lĩnh vực, khóa đào tạo, chương trình đào tạo
router.use('/categories', require('./admin.categories'));

/// Quản lí các khóa luận
router.use('/theses', require('./admin.theses'));

/// Các công cụ hỗ trợ
router.use('/tools', require('./admin.tools'));

/// Quản lí các hội đồng
router.use('/councils', require('./admin.councils'));

module.exports = router;