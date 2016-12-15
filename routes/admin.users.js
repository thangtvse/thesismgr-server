/*
 * Project: ThesisMgr-Server
 * File: routes\users.js
 */
var express = require('express');
var router = express.Router();
var moderatorsCtrl = require('../controllers/admin/users.moderators.js');
var lecturersCtrl = require('../controllers/admin/users.lecturers.js');
var studentsCtrl = require('../controllers/admin/users.students.js');
var hasAccess = require('../middlewares/auth').hasAccess;
var multer = require('multer');
var upload = multer({dest: 'temp/'});
var publicBrowseAPICtrl = require('../controllers/public/browse.api');

// MODERATORS =========================================
/**
 * Lấy về view quản lí các moderator
 */
router.get('/moderators', [
    hasAccess('admin'),
    moderatorsCtrl.getView
]);

/**
 * Tạo một moderator
 */
router.post('/moderators/assign', [
    hasAccess('admin'),
    moderatorsCtrl.assignModerator
]);

/**
 * Xóa một moderator
 */
router.get('/moderators/revoke', [
    hasAccess('admin'),
    moderatorsCtrl.revokeModerator
]);


// LECTURERS =========================================

/**
 * Lấy về view quản lí các giảng viên
 */
router.get('/lecturers', [
    hasAccess('moderator'),
    lecturersCtrl.getLecturerListPage
]);

/**
 * API lấy về các giảng viên
 */
router.get('/api/lecturers', [
    hasAccess('moderator'),
    lecturersCtrl.getAllLecturersAPI
]);

/**
 * API tìm giảng viên theo mã giảng viên
 */
router.get('/api/lecturers/search-by-officer-number', [
    hasAccess('moderator'),
    lecturersCtrl.searchLecturerByOfficerNumberAPI
]);

/**
 * API tìm giảng viên theo tên, không populate
 */
router.get('/api/lecturers/search-fast', [
    hasAccess('moderator'),
    publicBrowseAPICtrl.searchLecturerByNameNoPaginationAPI
]);

/**
 * Tạo giảng viên
 */
router.post('/lecturers/create', [
    hasAccess('moderator'),
    lecturersCtrl.createLecturer
]);

/**
 * Tạo giảng viên bằng file excel
 */
router.post('/lecturers/create-xlsx', [
    hasAccess(['moderator']),
    upload.single('xlsx'),
    lecturersCtrl.createUsingXLSX
]);


// STUDENTS =========================================

/**
 * Lấy view quản lí sinh viên
 */
router.get('/students', [
    hasAccess('moderator'),
    studentsCtrl.getStudentListPage
]);

/**
 * API lấy về các sinh viên
 */
router.get('/api/students', [
    hasAccess('moderator'),
    studentsCtrl.getAllStudentsAPI
]);
//
// router.get('/api/students/search-by-officer-number', [
//     hasAccess('moderator'),
//     studentsCtrl.searchStudentByOfficerNumberAPI
// ]);

/**
 * Tạo sinh viên
 */
router.post('/students/create', [
    hasAccess('moderator'),
    studentsCtrl.createStudent
]);

/**
 * Tạo sinh viên bằng file excel
 */
router.post('/students/create-xlsx', [
    hasAccess(['moderator']),
    upload.single('xlsx'),
    studentsCtrl.createUsingXLSX
]);

/**
 * API cập nhật thông tin sinh viên
 */
router.post('/api/students/update', [
    hasAccess('moderator'),
    studentsCtrl.updateStudentAPI
]);

/**
 * Upload file excel chứa danh sách các sinh viên đủ điều kiện đăng kí
 */
router.post('/students/upload_registrable_students_xlsx',[
    hasAccess('moderator'),
    upload.single('xlsx'),
    studentsCtrl.enableThesisRegistrableUsingXLSX
]);

module.exports = router;