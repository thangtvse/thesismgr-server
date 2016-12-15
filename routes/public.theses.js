var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var thesesCtrl = require('../controllers/public/theses');

router.get('/', [
    hasAccess('public'),
    thesesCtrl.getView
]);

router.get('/secretary', [
    hasAccess('lecturer'),
    thesesCtrl.thesesOfSecretary
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

router.post('/api/new', [
    hasAccess('student'),
    thesesCtrl.newThesisAPI
]);

router.post('/api/edit', [
    hasAccess('student'),
    thesesCtrl.requestChangeThesisAPI
]);

router.get('/:id/edit', [
    hasAccess('public'),
    thesesCtrl.editThesisView
]);

router.get('/:id', [
    hasAccess('public'),
    thesesCtrl.getThesisDetailsView
]);

router.get('/api/move-thesis-to-next-status', [
    hasAccess('public'),
    thesesCtrl.moveThesisToNextStatusAPI
]);

module.exports = router;