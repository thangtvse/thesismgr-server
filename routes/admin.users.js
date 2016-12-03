/*
 * Project: ThesisMgr-Server
 * File: routes\users.js
 */
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var moderatorsCtrl = require('../controllers/admin/users.moderators.js');
var lecturersCtrl = require('../controllers/admin/users.lecturers.js');
var studentsCtrl = require('../controllers/admin/users.students.js');
var hasAccess = require('../middlewares/auth').hasAccess;
var multer = require('multer');
var upload = multer({dest: 'temp/'});


// MODERATORS =========================================
router.get('/moderators', [
    hasAccess('admin'),
    moderatorsCtrl.getView
]);

router.post('/moderators/assign', [
    hasAccess('admin'),
    moderatorsCtrl.assignModerator
]);

router.post('/moderators/revoke', [
    hasAccess('admin'),
    moderatorsCtrl.revokeModerator
]);


// LECTURERS =========================================

router.get('/lecturers', [
    hasAccess('moderator'),
    lecturersCtrl.getLecturerListPage
]);

router.get('/api/lecturers', [
    hasAccess('moderator'),
    lecturersCtrl.getAllLecturersAPI
]);

router.get('/api/lecturers/search-by-officer-number', [
    hasAccess('moderator'),
    lecturersCtrl.searchLecturerByOfficerNumberAPI
]);

router.post('/lecturers/create', [
    hasAccess('moderator'),
    lecturersCtrl.createLecturer
]);

router.post('/lecturers/create-xlsx', [
    hasAccess(['moderator']),
    upload.single('xlsx'),
    lecturersCtrl.createUsingXLSX
]);


// STUDENTS =========================================

router.get('/students', [
    hasAccess('moderator'),
    studentsCtrl.getStudentListPage
]);

router.get('/api/students', [
    hasAccess('moderator'),
    studentsCtrl.getAllStudentsAPI
]);
//
// router.get('/api/students/search-by-officer-number', [
//     hasAccess('moderator'),
//     studentsCtrl.searchStudentByOfficerNumberAPI
// ]);

router.post('/students/create', [
    hasAccess('moderator'),
    studentsCtrl.createStudent
]);

router.post('/students/create-xlsx', [
    hasAccess(['moderator']),
    upload.single('xlsx'),
    studentsCtrl.createUsingXLSX
]);

module.exports = router;