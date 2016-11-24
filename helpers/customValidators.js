/*
 * Project: ThesisMgr-Server
 * File: helpers\validator.js
 */

var getModel = require('express-waterline').getModels;


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

    isUsernameAvailable: function (username) {
        return new Promise(function (resolve, reject) {
            getModel('user').then(function (User) {
                User.findOne({username: username})
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

    isOfficeIDAvailable: function (officeID) {
        return new Promise(function (resolve, reject) {
            getModel('office').then(function (Office) {
                Office.findOne({_id: officeID})
                    .then(function (office) {
                        if (office) {
                            resovle;
                        } else {
                            reject(office)
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
    }
};




