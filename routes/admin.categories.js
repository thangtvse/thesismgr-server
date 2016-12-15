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
/**
 * Lấy view hiển thị các lĩnh vực
 */
router.get('/fields', [
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.getView('field')
]);

/**
 * Tạo lĩnh vực
 */
router.post('/fields', [
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.post('field')
]);

/**
 * Xõa lĩnh vực
 */
router.get('/fields/delete',[
  hasAccess('admin'),
    hierarchicalCategoriesCtrl.delete('field')
]);

/**
 * Đổi tên lĩnh vực
 */
router.post('/fields/update',[
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.update('field')
]);

// Units =========================
/**
 * Lấy view hiển thị các đơn vị
 */
router.get('/units', [
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.getView('unit')
]);

/**
 * Tạo đơn vị
 */
router.post('/units', [
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.post('unit')
]);

/**
 * Xóa đơn vị
 */
router.get('/units/delete',[
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.delete('unit')
]);

/**
 * Xóa đơn vị
 */
router.post('/units/update',[
    hasAccess('admin'),
    hierarchicalCategoriesCtrl.update('unit')
]);

// Courses ===========================
/**
 * Lấy view hiển thị các khóa học
 */
router.get('/courses', [
    hasAccess('moderator'),
    listCategoriesCtrl.getView('course')
]);

/**
 * Tạo khóa học
 */
router.post('/courses', [
    hasAccess('moderator'),
    listCategoriesCtrl.post('course')
]);

/**
 * Xóa khóa học
 */
router.get('/courses/delete',[
    hasAccess('moderator'),
    listCategoriesCtrl.delete('course')
]);

/**
 * Đổi tên khóa học
 */
router.post('/courses/update',[
    hasAccess('moderator'),
    listCategoriesCtrl.update('course')
]);


// Programs ============================
/**
 * Lấy view hiển thị các chương trình
 */
router.get('/programs', [
    hasAccess('moderator'),
    listCategoriesCtrl.getView('program')
]);

/**
 * Tạo chương trình đào tạo
 */
router.post('/programs', [
    hasAccess('moderator'),
    listCategoriesCtrl.post('program')
]);

/**
 * Xóa chương trình đào tạo
 */
router.get('/programs/delete',[
    hasAccess('moderator'),
    listCategoriesCtrl.delete('program')
]);

/**
 * Xóa chương trình đào tạo
 */
router.post('/programs/update',[
    hasAccess('moderator'),
    listCategoriesCtrl.update('program')
]);


module.exports = router;