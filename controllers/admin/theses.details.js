var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;

exports.getThesisDetailsView = function (req, res) {
    if (!req.params.id) {
        return res.redirect('/404');
    }

    getModel('thesis').then(function (Thesis) {
        Thesis.getThesisDetails(req.params.id, function (error, thesis) {
            if (error) {
                return res.redirect('/404');
            }

            if (!thesis) {
                return res.redirect('/404');
            }

            return res.render('./admin/theses/thesis-details.ejs', {
                req: req,
                message: req.flash('errorMessage'),
                thesis: thesis
            })
        })
    })
};

exports.moveThesisToNextStatusAPI = function(req, res) {
    req.checkQuery('index', 'Invalid selection index.').notEmpty().isInt();
    req.checkQuery('thesis_id', 'Invalid thesis id.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('thesis').then(function (Thesis) {
        Thesis.moveToNextStatus(req.user, req.query.thesis_id, req.query.index, function (error, status) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, status, null));
        })
    })
};