var express = require('express');
var router = express.Router();
var hasAccess = require('../middlewares/auth').hasAccess;

router.get('/', [
    hasAccess('moderator'),
    function (req, res) {
        res.render('./admin/index', {
            req: req
        });
    }
]);

router.use('/users', require('./admin.users'));
router.use('/categories', require('./admin.categories'));
router.use('/theses', require('./admin.theses'));

module.exports = router;