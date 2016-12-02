var express = require('express');
var router = express.Router();
var lecturersCtrl = require('../controllers/users.lecturers');

router.get('/lecturers/:id', lecturersCtrl.getLecturerByIdAPI);

module.exports = router;