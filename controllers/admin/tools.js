var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;
var docGenHelper = require('../../helpers/gendoc');
var fileSystem = require('fs');

exports.getView = function (req, res) {
    res.render('./admin/tools/tools.ejs', {
        req: req,
        message: req.flash('errorMessage')
    })
};

exports.exportStudentAndTutorListAPI = function (req, res) {
    getModel('thesis').then(function (Thesis) {
        Thesis.getAllPopulatedThesisList({
            faculty: req.user.faculty.id,
            status: 4
        }, function (error, theses) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            docGenHelper.genStudentAndTutorList(theses, function (error, buffer) {
                if (error) {
                    return res.status(400).send(createResponse(false, null, error.message));
                }

                res.writeHead(200, {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Length': buffer.byteLength
                });
                res.write(buffer);
                res.end();

            })

        })
    })
};