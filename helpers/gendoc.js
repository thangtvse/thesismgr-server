/**
 * Created by sunado on 12/13/2016.
 */
var fs = require("fs");
var Docxtemplater = require('docxtemplater');
var JSZip = require('jszip');
var _ = require("underscore");

var root = require('../setting').root;
const genStudentAndTutorListPath = root + "/templates/genStudentAndTutor.docx";
const tmp = root + "/tmp";

exports.genStudentAndTutorList = function (theses, next) {
    fs.readFile(genStudentAndTutorListPath, "binary", function (error, content) {
        if (error) {
            return next(error);
        }
        var zip = new JSZip(content);
        var doc = new Docxtemplater().loadZip(zip);
        // normalize data
        var students = [];
        _.forEach(theses, function (thesis, index) {
            var tmp = {};
            tmp.tt = index + 1;
            tmp.id = thesis.student.user.officerNumber;
            tmp.name = thesis.student.user.fullName;
            tmp.birthday = thesis.student.user.dateOfBirth;
            tmp.unit = thesis.student.user.unit.name;
            tmp.thesis = thesis.title;
            tmp.tutor = thesis.lecturer.user.fullName;
            students.push(tmp);
        });

        var data = {
            student: students,
            sum: students.length
        };
        doc.setData(data);
        doc.render();
        var buf = doc.getZip()
            .generate({type: "nodebuffer"});

        return next(null, buf);
    });
};
