var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var profileCtrl = require('../controllers/public/profile');

router.get('/', [
    hasAccess('public'),
    profileCtrl.getProfileView
]);

router.get('/edit', [
    hasAccess('public'),
    profileCtrl.getEditProfileView
]);

router.post('/api/update-profile', [
    hasAccess('public'),
    profileCtrl.editProfileAPI
]);

router.get('/change-password', [
    hasAccess('public'),
    profileCtrl.getChangePasswordView
]);

router.post('/api/change-password', [
    hasAccess('public'),
    profileCtrl.changePasswordAPI
]);

router.post('/api/add-topic', [
    hasAccess('lecturer'),
    profileCtrl.addTopicAPI
]);

module.exports = router;