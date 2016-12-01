var getModel = require('express-waterline').getModels;

module.exports = {
    identity: 'program',
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
            via: 'program'
        }
    },

    createOne: function (name, facultyID, next) {
        getModel('program').then(function (Program) {
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

                    Program.create({
                        name: name,
                        faculty: faculty
                    }).exec(function (error, newProgram) {
                        return next(error, newProgram);
                    })
                })
            })
        })
    }
};