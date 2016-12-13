var createResponse = require('../../helpers/response').createRes;
var bcrypt = require('bcrypt-nodejs');
var _ = require('underscore');
var nodemailer = require('nodemailer');
var mailTransportConfig = require('../../config/mail').transportConfig;
var fs = require('fs');
var util = require('util');
var getModel = require('express-waterline').getModels;
var randomstring = require('randomstring');
var paginationConfig = require('../../config/pagination');
var authHelper = require('../../helpers/auth');
var async = require('async');
var fs = require('fs');
var Docxtemplater = require('docxtemplater');
var JSZip = require('jszip');

exports.getNotice1= function (req,res) {
    var content=fs.readFileSync(__dirname + "/templates/temp1.docx", "binary");
    var zip = new JSZip(content);
    var doc=new Docxtemplater().loadZip(zip);
    var data;

    async.parallel([
        function (callback) {
            getModel('student').then(function (Student) {

            })
        }
    ],function (error) {
        if(error){
            console.log(error);
        }

    });
};