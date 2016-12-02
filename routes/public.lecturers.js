var express = require('express');
var router = express.Router();
var lecturersCtrl = require('../controllers/admin/users.lecturers.js');

router.get('/lecturers/:id', lecturersCtrl.getLecturerByIdAPI);

module.exports = router;