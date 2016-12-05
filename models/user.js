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
var slug = require('vietnamese-slug');


var login = function (officerNumber, password, next) {

    getModel('user').then(function (User) {
        User.findOne({officerNumber: officerNumber}, function (error, user) {
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

var hashPassword = function (password, next) {
    // hash password
    bcrypt.genSalt(10, function (error, salt) {
        if (error) {
            console.log(error);
            return next(error);
        }

        bcrypt.hash(password, salt, null, function (error, hash) {
            if (error) {
                console.log(error);
                return next(error);
            }

            next(null, hash);
        });
    });
};

var beforeSave = function (values, next) {
    var functionArray = [];

    if (values.password) {
        functionArray.push(function (callback) {
            hashPassword(values.password, function (error, hash) {
                if (error) {
                    return callback(error);
                }

                values.password = hash;
                return callback();
            })
        })
    }

    if (values.fullName) {
        functionArray.push(function (callback) {
            values.slugFullName = slug(values.fullName);
            return callback();
        })
    }

    async.parallel(functionArray, function (errors) {
        if (errors && errors.length > 0) {
            return next(errors[0]);
        }

        return next();
    })
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

        email: {
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

        faculty: {
            model: 'unit'
        },

        unit: {
            model: 'unit',
            required: true,
        },

        role: {
            type: 'string',
            in: ['admin', 'lecturer', 'moderator', 'student'],
            required: true
        },

        lecturer: {
            collection: 'lecturer',
            via: 'user'
        },

        student: {
            collection: 'student',
            via: 'user'
        }
    },

    beforeCreate: function (values, next) {
        return beforeSave(values, next);
    },

    beforeUpdate: function (values, next) {
        return beforeSave(values, next);
    },

    /**
     * Login with admin account
     * @param officerNumber
     * @param password
     * @param next
     */
    adminLogin: function (officerNumber, password, next) {
        login(officerNumber, password, function (error, result, user) {
            if (user && user.role != 'admin' && user.role != 'moderator') {
                return next(null, false);
            }

            return next(error, result, user);
        })
    },

    /**
     * Create a list of user using xlsx. All user must be in a specified faculty. If this faculty is root unit,
     * users has not to be in any specified faculty.
     * @param role
     * @param specifiedFaculty
     * @param filePath
     * @param mailTransporter
     * @param senderEmail
     * @param afterCreateAnUser
     * @param next
     */
    createUsingXLSX: function (role, specifiedFaculty, filePath, afterCreateAnUser, next) {

        getModel('user').then(function (User) {
            getModel('unit').then(function (Unit) {
                // find all units
                Unit.find(function (error, units) {

                    if (error) {
                        return next([error])
                    }

                    // get all unit names

                    var filteredUnits = _.filter(units, function (unit) {
                        return (unit.name != null);
                    });

                    var unitNames = _.map(filteredUnits, function (unit) {
                        return unit.name;
                    });


                    // create a queue object with concurrency 2
                    var q = async.queue(function (task, callback) {

                        var row = task.row;

                        if (row._number == 1) {
                            return callback();
                        }

                        // File format: No., Officer Number, Full Name, Unit, Email
                        var values = row.values;

                        // get email
                        var email = values[5];
                        if (!email) {
                            return callback();
                        }

                        if (email.text) {
                            email = email.text;
                        }

                        // random password
                        var password = randomstring.generate(10);

                        // find best match unit

                        if (typeof values[4] != 'string') {
                            return callback(new Error('File error: Wrong format!'));
                        }
                        var bestMatchUnitName = stringSimilarity.findBestMatch(row.values[4], unitNames).bestMatch.target;
                        var indexOfBestMatchUnit = unitNames.indexOf(bestMatchUnitName);
                        // find index of best match unit name in the units array
                        if (indexOfBestMatchUnit == -1) {
                            var error = new Error("Internal error.");
                            return callback(error, email);
                        }

                        var unit = filteredUnits[indexOfBestMatchUnit];

                        var process = function () {
                            // save new user

                            Unit.getFacultyOfUnit(unit, function (error, faculty) {
                                if (error) {
                                    return callback(error, email);
                                }

                                User.create({
                                    officerNumber: values[2],
                                    email: email,
                                    password: password,
                                    unit: unit,
                                    faculty: faculty,
                                    fullName: values[3],
                                    role: role
                                }).exec(function (error, newUser) {
                                    if (error) {
                                        return callback(error, email);
                                    }

                                    return afterCreateAnUser(values, newUser, password, callback);

                                });

                            });
                        };


                        if (specifiedFaculty.left != 1 && unit != specifiedFaculty) {

                            Unit.getFacultyOfUnit(unit, function (error, faculty) {
                                if (faculty != specifiedFaculty) {
                                    return callback(new Error("User: " + email + " is not in your faculty (" + specifiedFaculty.name + ")"));
                                }

                                process();
                            });

                        } else {
                            process();
                        }

                    }, 20);

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
                            worksheet.eachRow({includeEmpty: false}, function (row, rowNumber) {

                                q.push({
                                    row: row,
                                    rowNumber: rowNumber
                                }, function (error) {
                                    if (error) {
                                        responseErrors.push(error);
                                    }
                                })
                            })
                        })
                })
            });
        });
    },


    /**
     * Create one user
     * @param officerNumber
     * @param email
     * @param password
     * @param unitID
     * @param fullName
     * @param role
     * @param senderEmail
     * @param mailTransporter
     * @param next
     */
    createOne: function (officerNumber, email, unitID, fullName, role, next) {
        getModel('user').then(function (User) {


            var password = randomstring.generate(10);

            //get Faculty
            getModel('unit').then(function (Unit) {

                Unit.getFacultyOfUnitID(unitID, function (error, faculty) {


                    if (error) {
                        console.log(error);
                        return next(error);
                    }


                    User.create({
                        officerNumber: officerNumber,
                        email: email,
                        password: password,
                        unit: unitID,
                        faculty: faculty,
                        fullName: fullName,
                        role: role
                    }).exec(function (error, newUser) {
                        console.log(util.inspect(newUser));
                        return next(error, newUser, password);
                    });
                })
            });
        });
    },

    changePassword: function (officerNumber, oldPassword, newPassword, next) {
        login(officerNumber, oldPassword, function (error, user) {
            if (error) {
                return next(error, false, null);
            }

            if (!user) {
                return next(new Error("User not found."), false, null);
            }

            user.password = newPassword;
            user.save(function (error) {
                if (error) {
                    return next(error, false, null);
                }

                return next(error, true, user);
            });
        })
    }
};