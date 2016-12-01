var getModel = require('express-waterline').getModels;

module.exports = {
    identity: 'file',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },

        path: {
            type: 'string',
            required: true
        },

        thesis: {
            model: 'thesis'
        }

    }
};