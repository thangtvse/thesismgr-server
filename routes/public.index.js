var express = require('express');
var router = express.Router();
var navMiddleware = require('../middlewares/nav');
var BrowseAPICtrl  = require('../controllers/public/browse.api');
/**
 * Middleware for getting units and fields tree
 */

router.use(navMiddleware.getNavTree);

router.get('/api/get_lecturers', [
    // hasAccess('student'),
    BrowseAPICtrl.getAllLecturersAPI
]);

router.get('/api/get_lecturers_in_unit', [
    // hasAccess('student'),
    BrowseAPICtrl.getAllLecturersInAUintAPI
]);

router.use('/units', require('./public.browse.units'));
router.use('/fields', require('./public.browse.fields'));
router.use('/lecturers', require('./public.browse.lecturers'));
router.use('/lecturer', require('./public.lecturer.js'));

router.use('/', function (req, res) {
    res.render('./public/index', {req: req});
});

module.exports = router;