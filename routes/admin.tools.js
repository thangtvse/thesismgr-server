var express = require('express');
var router = express.Router();
var hasRole = require('../middlewares/auth').hasRole;
var toolsCtrl = require('../controllers/admin/tools');

router.get('/', [
    hasRole('moderator'),
    toolsCtrl.getView
]);

router.get('/export-student-and-tutor-list', [
    hasRole('moderator'),
    toolsCtrl.exportStudentAndTutorListAPI
]);

router.get('/send-email-for-students-need-submit-files', [
    hasRole('moderator'),
    toolsCtrl.sendMailForStudentsNeedSubmitFilesAPI
]);

router.get('/export-protectable-student-list', [
    hasRole('moderator'),
    toolsCtrl.exportProtectableStudentListAPI
]);

router.get('/export-thesis-council-list', [
    hasRole('moderator'),
    toolsCtrl.exportThesisAndCouncilListAPI
]);

module.exports = router;