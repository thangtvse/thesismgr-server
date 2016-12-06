var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var session = require('express-session');
var adminAuthCtrl = require('../controllers/authentication');
var passport = require('passport');
var hasAccess = require('../middlewares/auth').hasAccess;


router.use(expressValidator({
    customValidators: require('../helpers/customValidators')
}));

router.use(session({
    secret: 'thesismgr-system-uet-vnu', // session secret
    resave: true,
    saveUninitialized: true
}));
router.use(passport.initialize());
router.use(passport.session()); // persistent login sessions
require('../config/passport')(passport);

router.get('/login', adminAuthCtrl.getLogin);

router.post('/login', passport.authenticate('admin-login', {
    successRedirect: '/admin', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

router.get('/400', function (req, res) {
    res.render('./partials/400')
});

router.get('/404', function (req, res) {
    res.render('./partials/404')
});

router.get('/500', function (req, res) {
    res.render('./partials/500')
});


router.use('/admin', require('./admin.index.js'));
router.use("/student",require('./student.index'));
router.use('/', require('./public.index'));



module.exports = router;