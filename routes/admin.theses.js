var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var SessionsCtrl = require('../controllers/admin/theses.sessions');
var ThesesCtrl = require('../controllers/admin/theses.theses');
var DetailsCtrl = require('../controllers/admin/theses.details');
// Sessions
router.get('/sessions', [
    hasAccess('moderator'),
    SessionsCtrl.getView
]);

router.get('/api/sessions', [
    hasAccess('moderator'),
    SessionsCtrl.getAllSessionsAPI
]);

router.post('/sessions/create', [
    hasAccess('moderator'),
    SessionsCtrl.createSession
]);

router.post('/api/sessions/notify', [
    hasAccess('moderator'),
    SessionsCtrl.notifyAPI
]);

/**
 * Lấy view quản lí các khóa luận
 */
router.get('/theses', [
    hasAccess('moderator'),
    ThesesCtrl.getView
]);

/**
 * API lấy về các khóa luận
 */
router.get('/api/theses', [
    hasAccess('moderator'),
    ThesesCtrl.getAllThesesAPI
]);

/**
 * Xem khóa luận theo id
 */
router.get('/:id', [
    hasAccess('moderator'),
    DetailsCtrl.getThesisDetailsView
]);

/**
 * API chuyển trạng thái của khóa luận
 */
router.get('/api/move-thesis-to-next-status', [
    hasAccess('moderator'),
    DetailsCtrl.moveThesisToNextStatusAPI
]);

/**
 * Export ra văn bản yêu cầu dừng khóa luận
 */
router.get('/api/export-stop-request-doc', [
    hasAccess('moderator'),
    ThesesCtrl.exportStopRequestDocAPI
]);

/**
 * Phân công hội đồng cho khóa luận
 */
router.post('/assign-council', [
    hasAccess('moderator'),
    DetailsCtrl.assignCouncil
]);

module.exports = router;