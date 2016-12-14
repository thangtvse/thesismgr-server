var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var councilsCtrl = require('../controllers/admin/councils');

router.get('/', [
    hasAccess('moderator'),
    councilsCtrl.getView
]);

router.get('/api/all', [
    hasAccess('moderator'),
    councilsCtrl.getCouncilsAPI
]);

router.get('/api/all-no-pagination', [
    hasAccess('moderator'),
    councilsCtrl.getAllCouncilsAPI
]);

router.post('/api/create', [
    hasAccess('moderator'),
    councilsCtrl.createCouncilAPI
]);

module.exports = router;