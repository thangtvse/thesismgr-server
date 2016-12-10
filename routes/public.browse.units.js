var express = require('express');
var router = express.Router();
var browseUnitsCtrl = require('../controllers/public/browse.units');
var hasAccess = require('../middlewares/auth').hasAccess;

router.get("/", [
    hasAccess('public'),
    browseUnitsCtrl.getView
]);

router.get("/:slug", [
    hasAccess('public'),
    browseUnitsCtrl.getUnitView
]);

module.exports = router;