var express = require('express');
var router = express.Router();

router.use('/users', require('./public.lecturers'));

module.exports = router;