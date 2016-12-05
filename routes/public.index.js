var express = require('express');
var router = express.Router();

router.use('/lecturer', require('./public.lecturers'));

module.exports = router;