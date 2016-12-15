var express = require('express');
var router = express.Router();
var browseUnitsCtrl = require('../controllers/public/browse.units');
var hasAccess = require('../middlewares/auth').hasAccess;

/**
 * Lấy về view xem tất cả các đơn vị
 */
router.get("/", [
    hasAccess('public'),
    browseUnitsCtrl.getView
]);

/**
 * Xe một đơn vị dựa theo slug name
 */
router.get("/:slug", [
    hasAccess('public'),
    browseUnitsCtrl.getUnitView
]);

module.exports = router;