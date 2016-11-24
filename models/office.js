var getModel = require('express-waterline').getModels;
var beforeCreateANode = require('../helpers/tree').beforeCreateANode;
module.exports = {
    identity: 'office',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },

        parent: {
            model: 'office'
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
            via: 'office'
        }
    },
    beforeCreate: function (values, next) {
        getModel('office').then(function (Office) {
            beforeCreateANode(Office, values, next);
        })
    }
}
;