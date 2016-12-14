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

// Thesis
router.get('/theses', [
    hasAccess('moderator'),
    ThesesCtrl.getView
]);

router.get('/api/theses', [
    hasAccess('moderator'),
    ThesesCtrl.getAllThesesAPI
]);

router.get('/:id', [
    hasAccess('moderator'),
    DetailsCtrl.getThesisDetailsView
]);

router.get('/api/move-thesis-to-next-status', [
    hasAccess('moderator'),
    DetailsCtrl.moveThesisToNextStatusAPI
]);

router.get('/api/export-stop-request-doc', [
    hasAccess('moderator'),
    ThesesCtrl.exportStopRequestDocAPI
]);

router.post('/assign-council', [
    hasAccess('moderator'),
    DetailsCtrl.assignCouncil
]);

module.exports = router;