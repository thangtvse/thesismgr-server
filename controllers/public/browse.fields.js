var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;


exports.getView = function (req, res) {
    return res.render('./public/browse/lecturers_by_categories', {
        req: req,
        message: req.flash('errorMessage')
    });
};