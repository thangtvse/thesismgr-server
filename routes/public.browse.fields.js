var express = require('express');
var router = express.Router();
var browseUnitsCtrl = require('../controllers/public/browse.units');

router.get("/:slug", [
    browseUnitsCtrl.getView
]);

module.exports = router;