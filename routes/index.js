var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator({
    customValidators: require('../helpers/customValidators')
}));

/**
 * Trang index
 */
router.get('/',function (req,res) {
   res.render('./index');
});

router.get('/400', function (req, res) {
    res.render('./partials/400')
});

router.get('/404', function (req, res) {
    res.render('./partials/404')
});

router.get('/500', function (req, res) {
    res.render('./partials/500')
});


/**
 * Sub-router của trang admin
 */
router.use('/admin', require('./admin.index.js'));
// router.use("/student",require('./public.student.js'));

/**
 * Sub-router của trang dành cho giảng viên và sinh viên
 */
router.use('/', require('./public.index'));


router.get('*', function (req, res) {
    res.render('./partials/404')
});


module.exports = router;