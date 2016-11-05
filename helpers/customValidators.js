/*
 * Project: ThesisMgr-Server
 * File: helpers\validator.js
 */

var User = require('../models/User');
var Field = require('../models/Field');
var Office = require('../models/Office');


module.exports = {

    isOfficerNumberAvailable: function (officerNumber) {
        return new Promise(function (resolve, reject) {
            User.findOne({ officerNumber: officerNumber })
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
    },

    isUsernameAvailable: function (username) {
        return new Promise(function (resolve, reject) {
            User.findOne({ username: username })
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
    },

    isOfficeIDAvailable: function (officeID) {
        return new Promise(function (resolve, reject) {
            Office.findOne({ _id: officeID })
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
    },

    isFieldIDAvailable: function (fieldID) {
        return new Promise(function (resolve, reject) {
            Field.findOne({ _id: fieldID })
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
    }
}




