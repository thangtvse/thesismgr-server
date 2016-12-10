/*
 * Project: ThesisMgr-Server
 * File: helpers\validator.js
 */

var getModel = require('express-waterline').getModels;
var async = require('async');

module.exports = {

    isOfficerNumberAvailable: function (officerNumber) {
        return new Promise(function (resolve, reject) {

            getModel('user').then(function (User) {
                User.findOne({officerNumber: officerNumber})
                    .then(function (user) {
                        if (!user) {
                            resolve();
                        } else {
                            reject(user);
                        }
                    })
                    .catch(function (error) {
                        if (error) {
                            reject(error);
                        }
                    });
            });
        });
    },

    isEmailAvailable: function (email) {
        return new Promise(function (resolve, reject) {
            getModel('user').then(function (User) {
                User.findOne({email: email})
                    .then(function (user) {
                        if (!user) {
                            resolve();
                        } else {
                            reject(user);
                        }
                    })
                    .catch(function (error) {
                        if (error) {
                            reject(error);
                        }
                    });
            })
        });
    },

    isUnitIDAvailable: function (unitID) {
        return new Promise(function (resolve, reject) {
            getModel('unit').then(function (Unit) {
                Unit.findOne({id: unitID})
                    .then(function (unit) {
                        if (unit) {
                            resolve();
                        } else {
                            reject(unit)
                        }
                    })
                    .catch(function (error) {
                        if (error) {
                            reject(error);
                        }
                    })
            })
        })
    },

    isFieldIDAvailable: function (fieldID) {
        return new Promise(function (resolve, reject) {
            getModel('field').then(function (Field) {
                Field.findOne({_id: fieldID})
                    .then(function (field) {
                        if (field) {
                            resovle;
                        } else {
                            reject(field)
                        }
                    })
                    .catch(function (error) {
                        if (error) {
                            reject(error);
                        }
                    })
            })
        })
    },

    isFacultyIDAvailable: function (facultyID) {
        return new Promise(function (resolve, reject) {
            getModel('unit').then(function (Unit) {
                Unit.findOne({id: facultyID})
                    .then(function (unit) {
                        if (unit && unit.type == 'faculty') {
                            resolve();
                        } else {
                            reject(unit)
                        }
                    })
                    .catch(function (error) {
                        if (error) {
                            reject(error);
                        }
                    })
            })
        })
    },

    isFieldArrayStringAvailable: function (string) {

        return new Promise(function (resolve, reject) {
            var fieldIDs;

            try {
                fieldIDs = JSON.parse(string);
            } catch(error) {
                return reject(error);
            }

            async.forEach(fieldIDs, function (id, callback) {
                getModel('field').then(function (Field) {
                    Field.findOne({_id: id})
                        .then(function (field) {
                            if (field) {
                                return callback();
                            } else {
                                return callback(new Error ("Field not found."));
                            }
                        })
                        .catch(function (error) {
                            return callback(error);
                        })
                })
            }, function (errors) {
                if (errors && errors.length > 0) {
                    return reject(errors[0]);
                }

                return resolve();
            })
        })
    },

    gte: function(param, num) {
        return param >= num;
    }
};




