/*
 * Project: ThesisMgr-Server
 * File: routes\users.js
 */
var express = require('express');
var router = express.Router();
var User = require('../../models/User');
var usersCtrl = require('../../controllers/admin/users');
var hasAccess = require('../../middlewares/roles').hasAccess;
var multer = require('multer');
var upload = multer({ dest: 'temp/' });

router.get('/:id', usersCtrl.getUserByID);

router.get('/moderators/:id', [
    hasAccess(['moderator']),
    usersCtrl.getModeratorByID
]);



router.post('/create', [
    hasAccess('moderator'),
    usersCtrl.createUser
]);



router.post('/create_lecturers_xlsx', [
    hasAccess('moderator'),
    upload.single('xlsx'),
    usersCtrl.createLecturersUsingXLSX
]);

module.exports = router;