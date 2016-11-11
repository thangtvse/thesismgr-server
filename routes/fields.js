/*
 * Project: ThesisMgr-Server
 * File: routes\fields.js
 */

var express = require('express');
var router = express.Router();
var fieldsCtrl = require('../controllers/fields');
var hasAccess = require('../middlewares/auth').hasAccess;


router.get('/search', fieldsCtrl.searchField);

router.get('/', fieldsCtrl.getAllFields);

router.post('/', [
  hasAccess('admin'),
  fieldsCtrl.postField
]);



// router.delete('/:id',[
//   hasAccess('admin'),
//   fieldsCtrl.deleteField
// ]);


module.exports = router;