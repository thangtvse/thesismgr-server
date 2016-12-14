var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;
var docGenHelper = require('../../helpers/gendoc');
var fileSystem = require('fs');
var mailHelper = require('../../helpers/mail');
var mailConfig = require('../../config/mail');
var nodemailer = require('nodemailer');
var _ = require('underscore');

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

exports.sendMailForStudentsNeedSubmitFilesAPI = function (req, res) {
    getModel('thesis').then(function (Thesis) {
        Thesis.getAllPopulatedThesisList({
            faculty: req.user.faculty.id,
            status: 5
        }, function (error, theses) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            var mailTransporter = nodemailer.createTransport(mailConfig);

            _.forEach(theses, function (thesis) {
                mailHelper.sendMailForStudentsNeedSubmitFiles(thesis.lecturer.user.email,
                    thesis.title,
                    mailConfig.transportConfig.auth.user,
                    mailTransporter
                )
            });

            return res.send(createResponse(true, null, null));

        })
    })
};

exports.exportsCanDefendThesisListAPI = function (req, res) {

};