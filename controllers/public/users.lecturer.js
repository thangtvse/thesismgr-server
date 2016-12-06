var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;


exports.changePasswordAPI = function (req, res) {
    req.checkBody("old_password", "Invalid old password.").notEmpty();
    req.checkBody("new_password", "Invalid new password.").notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('user').then(function (User) {
        User.changePassword(req.user.officerNumber, req.body.old_password, req.body.new_password, function (error, result, user) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, null, "Change password successfully!"));
        })
    })

};

exports.getAllThesesAPI = function (req, res) {
    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }


    getModel('thesis').then(function (Thesis) {
        Thesis.getAllRequestForLecturer(req.query.page, req.user, function (error, theses) {
            if (error) {
                return res.send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, theses, null));
        })
    })
};

