/*
 * Project: ThesisMgr-Server
 * File: helpers\db.js
 */

var mongoose = require('mongoose');
var User = require('../models/User');
var bcrypt = require('bcrypt-nodejs');
var getModel = require('express-waterline').getModels;


module.exports = {

    /**
     * Connect to the database
     * @param dbURI {String} URI of mongo database
     */
    connectDatabase: function (dbURI) {
        /**
         * Created by uendn on 5/1/2016.
         */

        console.log("Connecting to MongoDB: " + dbURI);

        // Create the database connection
        mongoose.connect(dbURI);

        // CONNECTION EVENTS
        // When successfully connected
        mongoose.connection.on('connected', function () {
            console.log("DB connected");
        });

        // If the connection throws an error
        mongoose.connection.on('error', function (err) {
            console.log('DB connection has an error: ' + err);
        });

        // If the connection is disconnected
        mongoose.connection.on('disconnected', function () {
            console.log('DB disconnected');
        });

        // If the Node process ends, close the Mongoose connection
        process.on('SIGINT', function () {
            mongoose.connection.close(function () {
                console.log('Mongoose disconnected through the app termination');
                process.exit(0);
            })
        });
    },

    // /**
    //  * Create root user if not have one
    //  * @param username {String} root username
    //  * @param password {String} root password
    //  */
    // createRootUserIfNeeded: function (username, password) {
    //     User.findOne({
    //         role: 'admin'
    //     }, function (err, admin) {
    //
    //         if (err) {
    //             console.log('Create root error:\n' + err);
    //             return;
    //         }
    //
    //         if (!admin) {
    //             var newRoot = new User({
    //                 officerNumber: 0,
    //                 username: username,
    //                 password: password,
    //                 role: "admin"
    //             });
    //
    //             newRoot.save(function (err) {
    //                 if (err) {
    //                     if (err) {
    //                         console.log('Create admin error:\n' + err);
    //                         return;
    //                     }
    //                 }
    //             })
    //         }
    //     })
    // },

    createRootUserIfNeeded: function (username, password) {
        var User = getModel('user').then(function (Model) {

            Model.findOne({
                role: 'admin'
            }).exec(function (err, admin) {
                if (err) {
                    console.log(err);
                    return
                }

                if (admin) {
                    console.log("We already have an admin");
                    return;
                }

                Model.create({
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

    createRootOfficeIfNeeded: function () {
        var Office = getModel('office').then(function (Office) {
            Office.find({}).exec(function (error, offices) {
                if (error) {
                    console.log(error);
                    return
                }

                if (offices == null || offices.length == 0) {
                    // create a root

                }
            })
        })
    }
};
