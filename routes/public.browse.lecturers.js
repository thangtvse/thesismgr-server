var express = require('express');
var router = express.Router();
var browseLecturersCtrl = require('../controllers/public/browse.lecturers');
var hasAccess = require('../middlewares/auth').hasAccess;
router.get("/:id", [
    hasAccess('public'),
    browseLecturersCtrl.viewALecturer
]);

router.get("/", [
    hasAccess('public'),
    browseLecturersCtrl.getView
]);


module.exports = router;