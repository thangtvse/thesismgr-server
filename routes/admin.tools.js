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
])

module.exports = router;