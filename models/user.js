/**
 * Created by tranvietthang on 11/9/16.
 */

var getModel = require('express-waterline').getModels;
var bcrypt = require('bcrypt-nodejs');
var randomstring = require("randomstring");
var Excel = require('exceljs');
var stringSimilarity = require('string-similarity');
var async = require('async');
var util = require('util');
var _ = require('underscore');

var login = function (email, password, next) {

    getModel('user').then(function (User) {
        User.findOne({username: email}, function (error, user) {
            if (error) {
                return next(error);
            }

            if (!user) {
                return next(null, false);
            }

            bcrypt.compare(password, user.password, function (error, result) {

                if (error) {
                    return next({message: error}, null);
                }

                return next(null, result, user);

            })
        });
    });
};

var sendMail = function (username, password, senderEmail, mailTransporter) {
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"ThesisMgr System 👥" <' + senderEmail + '>', // sender address
        to: username, // list of receivers
        subject: 'Invitation Mail', // Subject line
        text: 'username: ' + username + "\n" + "password: " + password // plaintext body
        //  html: '<b>Hello world 🐴</b>' // html body
    };

    console.log("sending mail to " + username);
    // send mail with defined transport object
    mailTransporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(util.inspect(error, false, 2, true));
        }

        console.log(util.inspect(info, false, 2, true));
    });
};


module.exports = {
    identity: 'user',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        officerNumber: {
            type: 'string',
            unique: true,
            required: true
        },

        username: {
            type: 'string',
            unique: true,
            required: true
        },

        password: {
            type: 'string',
            required: true
        },

        fullName: {
            type: 'string'
        },

        office: {
            model: 'office'
        },

        fields: {
            collection: 'field',
            via: 'users',
            dominant: true
        },

        role: {
            type: 'string',
            required: true
        }
    },
    beforeCreate: function (values, next) {

        bcrypt.genSalt(10, function (error, salt) {
            if (error) return next(error);

            bcrypt.hash(values.password, salt, null, function (error, hash) {
                if (error) return next(error);

                values.password = hash;
                next();
            });
        });
    },

    /**
     * Login with admin account
     * @param email
     * @param password
     * @param next
     */
    adminLogin: function (email, password, next) {
        login(email, password, function (error, result, user) {
            if (user && user.role != 'admin') {
                return next(null, false);
            }

            return next(error, result, user);
        })
    },

    /**
     * Create a list of user using xlsx
     * @param role
     * @param filePath
     * @param mailTransporter
     * @param senderEmail
     * @param next
     */
    createUsingXLSX: function (role, filePath, mailTransporter, senderEmail, next) {
        getModel('office').then(function (Office) {
            // find all offices
            Office.find(function (error, offices) {

                if (error) {
                    return next([error])
                }

                // get all office names

                var filterdOffices = _.filter(offices, function (office) {
                    return (office.name != null);
                });

                var officeNames = _.map(filterdOffices, function (office) {
                    return office.name;
                });


                // create a queue object with concurrency 2
                var q = async.queue(function (task, callback) {

                    var row = task.row;

                    if (row._number == 1) {
                        return callback();
                    }

                    // File format: No., Officer Number, Full Name, Office, Username
                    var values = row.values;

                    // get username
                    var username = values[5];
                    if (username.text) {
                        username = username.text;
                    }

                    // random password
                    var password = randomstring.generate(10);

                    // find best match office
                    console.log("row value: " + row.values[4] + " office name: " + officeNames + " with length: " + officeNames.length);
                    var bestMatchOfficeName = stringSimilarity.findBestMatch(row.values[4], officeNames).bestMatch.target;
                    var indexOfBestMatchOffice = officeNames.indexOf(bestMatchOfficeName);

                    // find index of best match office name in the offices array
                    if (indexOfBestMatchOffice == -1) {
                        var error = new Error("Internal error.");
                        return callback(error, username);
                    }


                    getModel('user').then(function (User) {
                        // save new lecturer

                        User.create({
                            officerNumber: values[2],
                            username: username,
                            password: password,
                            officeID: offices[indexOfBestMatchOffice]._id,
                            fullName: values[3],
                            role: 'lecturer'
                        }).exec(function (error, newUser) {
                            if (error) {
                                return callback(error, username);
                            }

                            callback();

                            sendMail(username, password, senderEmail, mailTransporter);
                        });
                    });

                }, 2);


                var responseErrors = [];

                q.drain = function () {

                    if (responseErrors.length > 0) {

                        return next(responseErrors);

                    } else {
                        return next([]);
                    }

                };

                // read xlsx file
                var workbook = new Excel.Workbook();
                workbook.xlsx.readFile(filePath)
                    .then(function () {
                        var worksheet = workbook.getWorksheet("Sheet1");
                        worksheet.eachRow({includeEmpty: true}, function (row, rowNumber) {

                            q.push({
                                row: row,
                                rowNumber: rowNumber
                            }, function (error, username) {
                                if (error) {
                                    responseErrors.push({
                                        username: username,
                                        errorMessage: error.message
                                    })
                                }
                            })
                        })
                    })
            })
        });
    },


    createOne: function (officerNumber, username, password, officeID, fullName, role, senderEmail, mailTransporter, next) {
        getModel('user').then(function (User) {

            User.create({
                officerNumber: officerNumber,
                username: username,
                password: password,
                officeID: officeID,
                fullName: fullName,
                role: role
            }).exec(function (error, newUser) {
                next(error, newUser);

                sendMail(username, password, senderEmail, mailTransporter);
            });
        });
    }
};