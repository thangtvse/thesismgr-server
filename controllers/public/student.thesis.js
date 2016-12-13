var getModel = require('express-waterline').getModels;
var paginationConfig = require('../../config/pagination');
var _ = require('underscore');
var createResponse = require('../../helpers/response').createRes;
var authHelper = require('../../helpers/auth');
var nodemailer = require('nodemailer');
var mailTransportConfig = require('../../config/mail').transportConfig;
var util = require('util');


exports.getAllThesesAPI = function (req, res) {
    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }


    getModel('thesis').then(function (Thesis) {
        Thesis.getAllRequestForStudent(req.query.page, req.user, function (error, theses) {
            if (error) {
                return res.send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, theses, null));
        })
    })
};

exports.createThesisAPI = function (req,res) {

};