/*
 * Project: ThesisMgr-Server
 * File: routes\offices.js
 */

var express = require('express');
var router = express.Router();
var officesCtrl = require('../controllers/offices');


router.get('/search', officesCtrl.searchOffice);

router.get('/', officesCtrl.getAllOffices);

router.get('/:id', officesCtrl.getOfficeById);

router.post('/', officesCtrl.postOffice);

module.exports = router;