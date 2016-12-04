/*
 * Project: ThesisMgr-Server
 * File: routes\fields.js
 */

var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;
var util = require('util');
var hierarchicalCategoriesCtrl = require('../controllers/admin/categories.hierarchy.js');
var listCategoriesCtrl = require('../controllers/admin/categories.list.js');
// router.get('/search', fieldsCtrl.searchField);

// Fields ========================
router.get('/fields', [
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.getView('field')
]);

router.post('/fields', [
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.post('field')
]);

router.get('/fields/delete',[
  hasAccess('admin'),
    hierarchicalCategoriesCtrl.delete('field')
]);

router.post('/fields/update',[
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.update('field')
]);

// Units =========================
router.get('/units', [
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.getView('unit')
]);

router.post('/units', [
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.post('unit')
]);

router.get('/units/delete',[
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.delete('unit')
]);

router.post('/units/update',[
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.update('unit')
]);

// Courses ===========================
router.get('/courses', [
    hasAccess('moderator'),
    listCategoriesCtrl.getView('course')
]);

router.post('/courses', [
    hasAccess('moderator'),
    listCategoriesCtrl.post('course')
]);

router.get('/courses/delete',[
    hasAccess('moderator'),
    listCategoriesCtrl.delete('course')
]);

router.post('/courses/update',[
    hasAccess('moderator'),
    listCategoriesCtrl.update('course')
]);


// Programs ============================
router.get('/programs', [
    hasAccess('moderator'),
    listCategoriesCtrl.getView('program')
]);

router.post('/programs', [
    hasAccess('moderator'),
    listCategoriesCtrl.post('program')
]);

router.get('/programs/delete',[
    hasAccess('moderator'),
    listCategoriesCtrl.delete('program')
]);

router.post('/programs/update',[
    hasAccess('moderator'),
    listCategoriesCtrl.update('program')
]);


module.exports = router;