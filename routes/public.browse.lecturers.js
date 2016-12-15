var express = require('express');
var router = express.Router();
var browseLecturersCtrl = require('../controllers/public/browse.lecturers');
var hasAccess = require('../middlewares/auth').hasAccess;

/**
 * Xem một giảng viên dựa theo mã giảng viên
 */
router.get("/:id", [
    hasAccess('public'),
    browseLecturersCtrl.viewALecturer
]);

/**
 * Lấy về view tìm kiếm giảng viên theo tên và theo chủ đề nghiên cứu
 */
router.get("/", [
    hasAccess('public'),
    browseLecturersCtrl.getView
]);


module.exports = router;