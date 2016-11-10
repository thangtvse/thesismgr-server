var getModel = require('express-waterline').getModels;
var beforeCreateANode = require('../helpers/tree').beforeCreateANode;
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
            type: 'integer',
            required: true
        },

        right: {
            type: 'integer',
            required: true
        },

        users: {
            collection: 'user',
            via: 'fields'
        }
    },
    beforeCreate: function (values, next) {
        getModel('field').then(function (Field) {
            beforeCreateANode(Field, values, next);
        })
    }
};