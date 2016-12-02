var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');

router.use(expressValidator({
    customValidators: require('../helpers/customValidators')
}));

router.use('/', require('./admin.index.js'));
router.use('/public', require('./public.index'));

module.exports = router;