var express = require('express');
var router = express.Router();
var browseLecturersCtrl = require('../controllers/public/browse.lecturers');

router.get("/:id", [
    browseLecturersCtrl.viewALecturer
]);

module.exports = router;