var express = require('express');
var router = express.Router();
var hasRole = require('../middlewares/auth').hasRole;
var toolsCtrl = require('../controllers/admin/tools');

/**
 * Lấy view các công cụ hỗ trợ
 */
router.get('/', [
    hasRole('moderator'),
    toolsCtrl.getView
]);

/**
 * Export ra danh sách các sinh viên và giảng viên hướng dẫn
 */
router.get('/export-student-and-tutor-list', [
    hasRole('moderator'),
    toolsCtrl.exportStudentAndTutorListAPI
]);

/**
 * Gửi mail cho các sinh viên yêu cầu nộp hồ sơ bảo vệ
 */
router.get('/send-email-for-students-need-submit-files', [
    hasRole('moderator'),
    toolsCtrl.sendMailForStudentsNeedSubmitFilesAPI
]);

/**
 * Export ra danh sách các sinh viên đủ điều kiện bảo vệ
 */
router.get('/export-protectable-student-list', [
    hasRole('moderator'),
    toolsCtrl.exportProtectableStudentListAPI
]);

/**
 * Export ra danh sách các đề tài cùng hội đồng bảo vệ
 */
router.get('/export-thesis-council-list', [
    hasRole('moderator'),
    toolsCtrl.exportThesisAndCouncilListAPI
]);

module.exports = router;