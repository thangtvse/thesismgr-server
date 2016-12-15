var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var councilsCtrl = require('../controllers/admin/councils');

/**
 * Lấy view quản lí các moderator
 */
router.get('/', [
    hasAccess('moderator'),
    councilsCtrl.getView
]);

/**
 * API lấy về các moderator
 */
router.get('/api/all', [
    hasAccess('moderator'),
    councilsCtrl.getCouncilsAPI
]);

/**
 * API lấy về các moderator không phân trang
 */
router.get('/api/all-no-pagination', [
    hasAccess('moderator'),
    councilsCtrl.getAllCouncilsAPI
]);

/**
 * Tạo moderator
 */
router.post('/api/create', [
    hasAccess('moderator'),
    councilsCtrl.createCouncilAPI
]);

module.exports = router;