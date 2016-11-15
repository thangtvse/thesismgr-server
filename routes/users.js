/*
 * Project: ThesisMgr-Server
 * File: routes\users.js
 */
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var usersCtrl = require('../controllers/users');
var hasAccess = require('../middlewares/auth').hasAccess;
var multer = require('multer');
var upload = multer({dest: 'temp/'});


router.get('/moderators',[
    hasAccess('admin'),
    function (req, res) {
        res.render('./users/moderators');
    }
]);

router.get('/api/moderators',[
    hasAccess('admin'),
    usersCtrl.getAllModerator
]);

router.post('/moderators/create_xlsx', [
    upload.single('xlsx'),
    usersCtrl.createUsingXLSX('moderator')
]);

router.get('/lecturers', [
    hasAccess('moderator'),
    function (req, res) {
        res.render('./users/lecturers');
    }
]);

router.post('/lecturers/create_xlsx', [
    upload.single('xlsx'),
    usersCtrl.createUsingXLSX('lecturer')
]);

router.get('/students', [
    hasAccess('moderator'),
    function (req, res) {
        res.render('./users/students');
    }
]);

router.post('/students/create_xlsx', [
    upload.single('xlsx'),
    usersCtrl.createUsingXLSX('student')
]);

// router.get('/:id', usersCtrl.getUserByID);

router.get('/moderators/:id', [
    hasAccess(['moderator']),
    usersCtrl.getModeratorByID
]);

router.post('/create', [
    hasAccess('moderator'),
    usersCtrl.createUser
]);



module.exports = router;