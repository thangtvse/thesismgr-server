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

router.get('/', [
    hasAccess('student'),
    function (req, res) {
        res.render('index', {
            req: req
        });
    }
]);

router.get('/login', adminAuthCtrl.getLogin);

router.post('/login', passport.authenticate('admin-login', {
    successRedirect: '/admin', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

router.use("/search",require('./search'));
router.use('/admin', require('./admin.index.js'));
router.use('/', require('./public.index'));
router.use("/student",require('./student.index'));

module.exports = router;