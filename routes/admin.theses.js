var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var SessionsCtrl = require('../controllers/admin/theses.sessions');
var ThesesCtrl = require('../controllers/admin/theses.theses');

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

module.exports = router;