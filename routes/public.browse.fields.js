var express = require('express');
var router = express.Router();
var browseFieldsCtrl = require('../controllers/public/browse.fields');
var hasAccess = require('../middlewares/auth').hasAccess;

router.get("/:slug", [
    hasAccess('public'),
    browseFieldsCtrl.getFieldView
]);

router.get("/", [
    hasAccess('public'),
    browseFieldsCtrl.getView
]);

module.exports = router;