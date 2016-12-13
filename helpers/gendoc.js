/**
 * Created by sunado on 12/13/2016.
 */
var fs = require("fs");
var Docxtemplater = require('docxtemplater');
var JSZip = require('jszip');
var _= require("underscore");
const genStudentAndTutorListPath= __dirname +"/template/genStudentAndTutor.docx";
const tmp = __dirname +"/tmp";

exports.genStudentAndTutorList = function (theses,timezone,next) {
     fs.readFile(genStudentAndTutorListPath,"binary",function (error,content) {
         if(error){
             return next(error);
         }
         var zip = new JSZip(content);
         var doc=new Docxtemplater().loadZip(zip);
         // normalize data
         var students= [];
         students.push( new Date);
         _.forEach(theses,function (thesis,index) {
             var tmp = {};
             tmp.tt=index+1;
             tmp.id=thesis.student.user.officerNumber;
             tmp.name= thesis.student.user.fullName;
             tmp.birthday=thesis.student.user.dateOfBirth;
             tmp.unit=thesis.student.user.unit;
             tmp.thesis=thesis.title;
             tmp.tutor= thesis.lecturer.user.fullName;
             students.push(tmp);
         });

         doc.setData();
         doc.render();
         var buf = doc.getZip()
             .generate({type:"nodebuffer"});

         fs.writeFile(tmp+"/noname.docx",buf,function (error) {
             if(error) return next(error);
             return next(null,tmp+"/nomane.docx");
         });
    });
};
