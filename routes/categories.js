/*
 * Project: ThesisMgr-Server
 * File: routes\fields.js
 */

var express = require('express');
var router = express.Router();
var fieldsCtrl = require('../controllers/fields');
var hasAccess = require('../middlewares/auth').hasAccess;
var util = require('util');

// router.get('/search', fieldsCtrl.searchField);

router.get('/fields', function (req, res) {
    var fields = require('../helpers/tree').createTree();
    console.log(util.inspect(fields));
    res.render('./categories/fields', {fields: require('../helpers/tree').createTree()})
});

// router.post('/', [
//     hasAccess('admin'),
//     fieldsCtrl.postField
// ]);



// router.delete('/:id',[
//   hasAccess('admin'),
//   fieldsCtrl.deleteField
// ]);


module.exports = router;