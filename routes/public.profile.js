var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var profileCtrl = require('../controllers/public/profile');

/**
 * Lấy view hiển thị profile
 */
router.get('/', [
    hasAccess('public'),
    profileCtrl.getProfileView
]);

/**
 * Lấy view sửa profile
 */
router.get('/edit', [
    hasAccess('public'),
    profileCtrl.getEditProfileView
]);

/**
 * API để update profile
 */
router.post('/api/update-profile', [
    hasAccess('public'),
    profileCtrl.editProfileAPI
]);

/**
 * Lấy view Đổi mật khẩu
 */
router.get('/change-password', [
    hasAccess('public'),
    profileCtrl.getChangePasswordView
]);

/**
 * Đổi mật khẩu
 */
router.post('/api/change-password', [
    hasAccess('public'),
    profileCtrl.changePasswordAPI
]);

/**
 * API tạo chủ đề nghiên cứu cho giảng viên
 */
router.post('/api/add-topic', [
    hasAccess('lecturer'),
    profileCtrl.addTopicAPI
]);

module.exports = router;