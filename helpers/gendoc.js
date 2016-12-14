/**
 * Created by sunado on 12/13/2016.
 */
var fs = require("fs");
var Docxtemplater = require('docxtemplater');
var JSZip = require('jszip');
var _ = require("underscore");
var getModel = require('express-waterline').getModels;
var root = require('../setting').root;
const genStudentAndTutorListPath = root + "/templates/genStudentAndTutor.docx";
const genCanDefendThesisListPath= root + "/templates/genCanDefendThesis.docx";
const genStopThesisListPath = root +"/templates/genStopThesis.docx";
const tmp = root + "/tmp";

exports.genStudentAndTutorList = function (theses, next) {

    getModel('unit').then(function (Unit) {
        Unit.find().exec(function (error, units) {

            if (error) {
                return next(error);
            }
            var students = [];
            _.forEach(theses, function (thesis, index) {
                var tmp = {};
                tmp.tt = index + 1;
                tmp.id = thesis.student.user.officerNumber;
                tmp.name = thesis.student.user.fullName;
                tmp.birthday = thesis.student.user.dateOfBirth;
                tmp.unit = _.find(units, function (item) {
                    return item.id == thesis.student.user.unit;
                }).name;
                tmp.thesis = thesis.title;
                tmp.tutor = thesis.lecturer.user.fullName;
                students.push(tmp);
            });

            var data = {
                student: students,
                sum: students.length
            };
             return createDoc(data,genStudentAndTutorListPath,next);
        })
    });

};
exports.genCanDefendThesisList = function (students,next) {
    getModel('unit').then(function (Unit) {
        Unit.find().exec(function (error,units) {
            if(error) {
                return next(error);
            }

            fs.readFile(genCanDefendThesisListPath,"binary",function (error,content) {
                if(error){
                    return next(error);
                }
                var zip = new JSZip(content);
                var doc = new Docxtemplater().loadZip(zip);
                // normalize data
                var studentList = [];
                var unitList=[];
                var counts=[];
                _.forEach(students,function (student,index) {
                    var tmp={};
                    tmp.tt=index+1;
                    tmp.name = student.user.fullName;
                    tmp.id = student.user.officerNumber;
                    tmp.unit = _.find(units, function (item) {
                        return item.id == student.user.unit;
                    }).name;
                    tmp.other= "";
                    studentList.push(tmp);
                });

                studentList.forEach(function (e) {
                    if(counts[e.unit]){
                        counts[e.unit].count++;
                    }else{
                        counts[e.unit]= {'val':e.unit, 'count':0};
                    }
                });

                _forEach(counts,function (e,index) {
                    var tmp = {};
                    tmp.tt=index+1;
                    tmp.unit=e.val;
                    tmp.number=e.count;
                    unitList.push(tmp);
                });
                var data={
                    "students":studentList,
                    "sum":studentList.length,
                    "units":unitList
                };
                doc.setData(data);
                doc.render();
                var buf = doc.getZip()
                    .generate({type: "nodebuffer"});

                return next(null, buf);
            })
        })
    });
};

exports.genStopThesisList = function (theses, next) {

    getModel('unit').then(function (Unit) {
        Unit.find().exec(function (error, units) {
            if (error) {
                return next(error);
            }
            var students = [];

            var tmp = {};
            tmp.tt =  1;
            tmp.id = theses.student.user.officerNumber;
            tmp.name = theses.student.user.fullName;
            tmp.unit = _.find(units, function (item) {
                return item.id == theses.student.user.unit;
            }).name;
            tmp.thesis = theses.title;
            tmp.tutor = theses.lecturer.user.fullName;

            students.push(tmp);

            var data = {
                student: students,
                sum: students.length
            };
            return createDoc(data,genStopThesisListPath,next);
        })
    });
};

function createDoc (data,templatePath,next) {
    fs.readFile(templatePath, "binary", function (error, content) {
        if (error) {
            return next(error);
        }
        var zip = new JSZip(content);
        var doc = new Docxtemplater().loadZip(zip);
        doc.setData(data);
        doc.render();
        var buf = doc.getZip()
            .generate({type: "nodebuffer"});

        return next(null, buf);
    });
}