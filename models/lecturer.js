var getModel = require('express-waterline').getModels;
var sendMail = require('../helpers/mail').sendMail;

module.exports = {
    identity: 'lecturer',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        user: {
            model: 'user',
            unique: true,
            required: true
        },

        studentTheses: {
            collection: 'thesis',
            via: 'lecturer'
        },

        fields: {
            collection: 'field'
        },

        councils: {
            collection: 'council',
            via: 'members'
        }
    },

    /**
     * Creaete one Lecturer
     * @param officerNumber
     * @param email
     * @param unitID
     * @param fullName
     * @param senderEmail
     * @param mailTransporter
     * @param next {function (Error, Lecturer)}
     */
    createOne: function (officerNumber, email, unitID, fullName, senderEmail, mailTransporter, next) {
        getModel('user').then(function (User) {
            User.createOne(officerNumber, email, unitID, fullName, 'lecturer', function (error, user, originalPassword) {

                if (error) {
                    return next(error);
                }

                getModel('lecturer').then(function (Lecturer) {
                    Lecturer.create({
                        user: user
                    }).exec(function (error, lecturer) {
                        next(error, lecturer);


                        return sendMail(email, originalPassword, senderEmail, mailTransporter);
                    })
                })
            })
        })
    },

    /**
     * Create a list of lecturers by using xlsx
     * @param specifiedFaculty
     * @param filePath
     * @param mailTransporter
     * @param senderEmail
     * @param next {function ([Error])}
     */
    createUsingXLSX: function (specifiedFaculty, filePath, mailTransporter, senderEmail, next) {

        getModel('user').then(function (User) {
            User.createUsingXLSX('lecturer', specifiedFaculty, filePath, function (values, user, originalPassword, callback) {
                    getModel('lecturer').then(function (Lecturer) {
                        Lecturer.create({
                            user: user
                        }).exec(function (error, lecturer) {
                            if (error) {
                                console.log(error);
                                return next([error]);
                            }

                            sendMail(user.email, originalPassword, senderEmail, mailTransporter);
                            return callback();
                        })
                    })
                },
                function (errors) {
                    next(errors);
                })
        })
    }
};