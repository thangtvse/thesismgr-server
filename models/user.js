/**
 * Created by tranvietthang on 11/9/16.
 */

var getModel = require('express-waterline').getModels;
var bcrypt = require('bcrypt-nodejs');

var login = function (email, password, next) {

    getModel('user').then(function (User) {
        User.findOne({username: email}, function (err, user) {
            if (err) {
                return next(err);
            }

            if (!user) {
                return next(null, false);
            }

            bcrypt.compare(password, user.password, function (err, result) {

                if (err) {
                    return next({message: err}, null);
                }

                return next(null, result, user);

            })
        });
    });
};


module.exports = {
    identity: 'user',
    connection: 'mongo',
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

        bcrypt.genSalt(10, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(values.password, salt, null, function (err, hash) {
                if (err) return next(err);

                values.password = hash;
                next();
            });
        });
    },
    adminLogin: function (email, password, next) {
        login(email, password, function (err, result, user) {
            if (user && user.role != 'admin') {
                return next(null, false);
            }

            return next(err, result, user);
        })
    }
};