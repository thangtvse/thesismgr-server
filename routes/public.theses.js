var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var thesesCtrl = require('../controllers/public/theses');

router.get('/', [
    hasAccess('public'),
    thesesCtrl.getView
]);

router.get('/api/all', [
    hasAccess('public'),
    thesesCtrl.getAllTheseAPI
]);

router.get('/api/number-of-pages', [
    hasAccess('public'),
    thesesCtrl.getNumberOfPagesAPI
]);

router.get('/new', [
    hasAccess('student'),
    thesesCtrl.getNewThesisView
]);


module.exports = router;