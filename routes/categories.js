/*
 * Project: ThesisMgr-Server
 * File: routes\fields.js
 */

var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var util = require('util');
var categoriesCtrl = require('../controllers/categories');

// router.get('/search', fieldsCtrl.searchField);

router.get('/fields', [
    hasAccess('admin'),
    categoriesCtrl.getFieldsView
]);

router.post('/fields', [
    hasAccess('admin'),
    categoriesCtrl.postField
]);



router.get('/fields/delete',[
  hasAccess('admin'),
    categoriesCtrl.deleteField
]);


module.exports = router;