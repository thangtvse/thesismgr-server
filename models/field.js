var getModel = require('express-waterline').getModels;
var treeHelper = require('../helpers/tree');
module.exports = {
    identity: 'field',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },

        parent: {
            model: 'field'
        },

        left: {
            type: 'integer'
        },

        right: {
            type: 'integer'
        },

        lecturers: {
            collection: 'lecturer',
            via: 'fields'
        }
    },

    beforeCreate: function (values, next) {
        getModel('field').then(function (Field) {
            treeHelper.beforeCreateANode(Field, values, next);
        })
    },

    getAllFields: function (next) {

        getModel('field').then(function (Field) {
            Field.find().exec(function (error, fields) {
                if (error) {
                    return next(error);
                }

                var filteredFields = fields.filter(function (field) {
                    if (field.left == 1) {
                        return false
                    } else {
                        return true
                    }
                });

                return next(error, filteredFields);
            })
        });
    }
};