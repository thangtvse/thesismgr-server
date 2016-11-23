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

// Fields ========================
router.get('/fields', [
    hasAccess('admin'),
    categoriesCtrl.getView('field')
]);

router.post('/fields', [
    hasAccess('admin'),
    categoriesCtrl.post('field')
]);

router.get('/fields/delete',[
  hasAccess('admin'),
    categoriesCtrl.delete('field')
]);

// Offices =========================
router.get('/offices', [
    hasAccess('admin'),
    categoriesCtrl.getView('office')
]);

router.post('/offices', [
    hasAccess('admin'),
    categoriesCtrl.post('office')
]);

router.get('/offices/delete',[
    hasAccess('admin'),
    categoriesCtrl.delete('office')
]);

module.exports = router;