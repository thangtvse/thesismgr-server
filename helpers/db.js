/*
 * Project: ThesisMgr-Server
 * File: helpers\db.js
 */

var bcrypt = require('bcrypt-nodejs');
var getModel = require('express-waterline').getModels;
var util = require('util');


/**
 * Create a new Admin if needed. Must call after a root unit has been already created.
 * @param email
 * @param password
 */
var createRootUserIfNeeded = function (email, password, next) {
    getModel('user').then(function (User) {

        User.findOne({
            role: 'admin'
        }).exec(function (err, admin) {
            if (err) {
                console.log(err);
                return next(err);
            }

            if (admin) {
                console.log('We already have an admin');
                console.log(util.inspect(admin, false, 2, true));
                return next(null, admin);
            }

            getModel('unit').then(function (Unit) {
                Unit.findOne({
                    left: 1
                }).exec(function (error, rootUnit) {
                    if (error) {
                        console.log(error);
                        return next(error);
                    }

                    User.create({
                        email: email,
                        password: password,
                        officerNumber: 'admin',
                        role: 'admin',
                        unit: rootUnit,
                        faculty: rootUnit,
                        fullName: 'admin'
                    }).exec(function (err, finn) {
                        return next(err, finn);
                    });
                })
            });


        });
    })
};

/**
 * Create a new root for unit collection if needed
 */
var createRootUnitIfNeeded = function (next) {
    getModel('unit').then(function (Unit) {
        Unit.findOne({
            name: 'root'
        }).exec(function (error, root) {
            if (error) {
                console.log(error);
                return next(error)
            }

            if (root == null) {
                // create a root
                Unit.create({
                    name: 'root',
                    left: 1,
                    right: 2,
                    type: 'root'
                }).exec(function (error, newUnit) {
                    return next(error, newUnit);
                })
            } else {
                return next(null, root);
            }
        })
    })
}

/**
 * Create a new root for field collection if needed
 */
var createRootFieldIfNeeded = function (next) {
    getModel('field').then(function (Field) {
        Field.findOne({
            name: 'root'
        }).exec(function (error, root) {
            if (error) {
                console.log(error);
                return next(error);
            }

            if (root == null) {
                // create a root
                Field.create({
                    name: 'root',
                    left: 1,
                    right: 2
                }).exec(function (error, newField) {
                    return next(error, newField);
                })
            } else {
                return next(null, root);
            }
        })
    })
};

/**
 * Create root unit, field and user.
 * @param next
 */
var initDB = function (next) {
    createRootFieldIfNeeded(function (error, rootField) {
        if (error) {
            return next(error);
        }

        createRootUnitIfNeeded(function (error, rootUnit) {
            if (error) {
                return next(error);
            }

            createRootUserIfNeeded('admin@gmail.com', 'nopassword', function (error, admin) {
                next(error, admin);
            });
        })
    })
};


module.exports = {
    initDB,
    createRootFieldIfNeeded,
    createRootUserIfNeeded,
    createRootUnitIfNeeded,
};

