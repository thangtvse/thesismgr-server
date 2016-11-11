/*
 * Project: ThesisMgr-Server
 * File: routes\offices.js
 */

var express = require('express');
var router = express.Router();
var officesCtrl = require('../controllers/offices');
var hasAccess = require('../middlewares/auth').hasAccess;

router.get('/search', officesCtrl.searchOffice);

router.get('/', officesCtrl.getAllOffices);

router.get('/:id', officesCtrl.getOfficeById);

router.post('/', [
    hasAccess('admin'),
    officesCtrl.postOffice
]);

module.exports = router;