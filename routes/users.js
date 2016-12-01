/*
 * Project: ThesisMgr-Server
 * File: routes\users.js
 */
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var usersCtrl = require('../controllers/users');
var hasAccess = require('../middlewares/auth').hasAccess;
var multer = require('multer');
var upload = multer({dest: 'temp/'});


// MODERATORS =========================================
router.get('/moderators', [
    hasAccess('admin'),
    usersCtrl.getUserListPage('moderator')
]);

router.get('/api/moderators', [
    hasAccess('admin'),
    usersCtrl.getAllUsers('moderator')
]);

router.get('/api/moderators/:id', [
    hasAccess(['moderator']),
    usersCtrl.getUserByID('moderator')
]);

router.post('/moderators/create', [
    hasAccess('admin'),
    usersCtrl.createUser('moderator')
]);

router.post('/moderators/create_xlsx', [
    hasAccess('admin'),
    upload.single('xlsx'),
    usersCtrl.createUsingXLSX('moderator')
]);


// LECTURERS =========================================

router.get('/lecturers', [
    hasAccess('moderator'),
    usersCtrl.getUserListPage('lecturer')
]);

router.get('/api/lecturers', [
    hasAccess('moderator'),
    usersCtrl.getAllUsers('lecturer')
]);

router.get('/api/lecturers/:id', [
    hasAccess(['student']),
    usersCtrl.getUserByID('lecturer')
]);

router.post('/lecturers/create', [
    hasAccess('moderator'),
    usersCtrl.createUser('lecturer')
]);

router.post('/lecturers/create_xlsx', [
    hasAccess(['moderator']),
    upload.single('xlsx'),
    usersCtrl.createUsingXLSX('lecturer')
]);


// STUDENTS =========================================

router.get('/students', [
    hasAccess('moderator'),
    usersCtrl.getUserListPage('student')
]);

router.get('/api/students', [
    hasAccess('moderator'),
    usersCtrl.getAllUsers('student')
]);

router.get('/api/students/:id', [
    hasAccess(['student']),
    usersCtrl.getUserByID('student')
]);

router.post('/students/create', [
    hasAccess('moderator'),
    usersCtrl.createUser('student')
]);

router.post('/students/create_xlsx', [
    upload.single('xlsx'),
    usersCtrl.createUsingXLSX('moderator')
]);

module.exports = router;