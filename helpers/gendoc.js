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
const genThesisAndCouncilList= root + "/templates/genThesisAndCouncil.docx";
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
exports.genCanDefendThesisList = function (theses,next) {
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
                _.forEach(theses,function (thesis,index) {
                    var tmp={};
                    tmp.tt=index+1;
                    tmp.name = thesis.student.user.fullName;
                    tmp.id = thesis.student.user.officerNumber;
                    tmp.unit = _.find(units, function (item) {
                        return item.id == thesis.student.user.unit;
                    }).name;
                    tmp.other= "";
                    studentList.push(tmp);
                });

                var data={
                    "student":studentList,
                    "sum":studentList.length,
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

exports.genThesisAndCouncilList= function (theses,councils,next) {
    var thesisList = [];
    _.forEach(theses,function (thesis,index) {
        var tmp={};
        tmp.tt=index+1;
        tmp.name = thesis.student.user.fullName;
        tmp.id = thesis.student.user.officerNumber;
        tmp.thesis = thesis.title;
        tmp.tutor = thesis.lecturer.user.fullName;
        tmp.mhd= thesis.council.name;
        thesisList.push(tmp);
    });
    console.log("fshaffialdaioddoai"+thesisList.length);
    var councilList =[];
    _.forEach(councils,function(council,index){
        var tmp={};
        tmp.tt=index+1;
        tmp.mhd=council.name;
        tmp.chairman= council.chairman.user.fullName;
        tmp.secretary=council.secretary.user.fullName;
        tmp.reviewer=council.reviewer.user.fullName;
        councilList.push(tmp);
    });
    console.log("sfuhauadaddi"+councilList.length);
    var data={
        'thesis':thesisList,
        'hd':councilList
    };


    return createDoc(data,genThesisAndCouncilList,next);
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