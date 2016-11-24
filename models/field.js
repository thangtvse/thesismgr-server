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

        users: {
            collection: 'user',
            via: 'fields'
        }
    },
    beforeCreate: function (values, next) {
        getModel('field').then(function (Field) {
            treeHelper.beforeCreateANode(Field, values, next);
        })
    }
};