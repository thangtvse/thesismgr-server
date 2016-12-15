var getModel = require('express-waterline').getModels;

module.exports = {
    identity: 'course',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },

        faculty: {
            model: 'unit',
            required: true
        },

        students: {
            collection: 'student',
            via: 'course'
        }
    },

    createOne: function (name, facultyID, next) {
        getModel('course').then(function (Course) {
            getModel('unit').then(function (Unit) {
                Unit.findOne({
                    id: facultyID,
                    type: 'faculty'
                }).exec(function (error, faculty) {
                    if (error) {
                        console.log(error);
                        return next(error);
                    }

                    if (faculty == null) {
                        return next(new Error('Faculty not found.'));
                    }

                    Course.create({
                        name: name,
                        faculty: faculty
                    }).exec(function (error, newCourse) {
                        return next(error, newCourse);
                    })
                })
            })
        })
    }
};