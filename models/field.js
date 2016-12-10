var getModel = require('express-waterline').getModels;
var treeHelper = require('../helpers/tree');
var slug = require('vietnamese-slug');

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

        slugName: {
            type: 'string',
            unique: true
        },

        urlName: {
            type: 'string',
            unique: true
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
        },

        theses: {
            collection: 'thesis',
            via: 'fields'
        },

        topics: {
            collection: 'topic',
            via: 'fields'
        }
    },

    beforeCreate: function (values, next) {
        getModel('field').then(function (Field) {
            treeHelper.beforeCreateANode(Field, values, function (error) {
                if (values.name) {
                    values.slugName = slug(values.name, ' ');
                    values.urlName = slug(values.name, '-');
                }
                next(error);
            });
        })
    },

    beforeUpdate: function (values, next) {

        if (values.name) {
            values.slugName = slug(values.name, ' ');
            values.urlName = slug(values.name, '-');
        }
        next();
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