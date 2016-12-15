var express = require('express');
var router = express.Router();
var browseFieldsCtrl = require('../controllers/public/browse.fields');
var hasAccess = require('../middlewares/auth').hasAccess;

/**
 * Xem một lĩnh vực theo slug name
 */
router.get("/:slug", [
    hasAccess('public'),
    browseFieldsCtrl.getFieldView
]);

/**
 * Lấy về view hiển thị tất cả lĩnh vực
 */
router.get("/", [
    hasAccess('public'),
    browseFieldsCtrl.getView
]);

module.exports = router;