/*
 * Project: ThesisMgr-Server
 * File: helpers\db.js
 */

var bcrypt = require('bcrypt-nodejs');
var getModel = require('express-waterline').getModels;
var util = require('util');

module.exports = {

    /**
     * Create a new Admin if needed
     * @param username
     * @param password
     */
    createRootUserIfNeeded: function (username, password) {
        getModel('user').then(function (User) {

            User.findOne({
                role: 'admin'
            }).exec(function (err, admin) {
                if (err) {
                    console.log(err);
                    return
                }

                if (admin) {
                    console.log('We already have an admin');
                    console.log(util.inspect(admin, false, 2, true));
                    return;
                }

                User.create({
                    username: username,
                    password: password,
                    officerNumber: '1',
                    role: 'admin'
                }).exec(function (err, finn) {
                    if (err) {
                        console.log(err);
                        return
                    }

                    console.log('Finn\'s id is:', finn.id);
                });
            });


        })
    },

    /**
     * Create a new root for office collection if needed
     */
    createRootOfficeIfNeeded: function () {
        getModel('office').then(function (Office) {
            Office.findOne({
                name: 'root'
            }).exec(function (error, root) {
                if (error) {
                    console.log(error);
                    return
                }

                if (root == null) {
                    // create a root
                    Office.create({
                        name: 'root',
                        left: 1,
                        right: 2
                    }).exec(function (error, newOffice) {
                        if (error) {
                            console.log(error);
                        }
                    })
                } else {
                    console.log('We already have a root office');
                    console.log(util.inspect(root, false, 2, true));
                }
            })
        })
    },

    /**
     * Create a new root for field collection if needed
     */
    createRootFieldIfNeeded: function () {
        getModel('field').then(function (Field) {
            Field.findOne({
                name: 'root'
            }).exec(function (error, root) {
                if (error) {
                    console.log(error);
                    return
                }

                if (root == null) {
                    // create a root
                    Field.create({
                        name: 'root',
                        left: 1,
                        right: 2
                    }).exec(function (error, newField) {
                        if (error) {
                            console.log(error);
                        }
                    })
                } else {
                    console.log('We already have a root field');
                    console.log(util.inspect(root, false, 2, true));
                }
            })
        })
    }
};
