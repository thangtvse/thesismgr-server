var getModel = require('express-waterline').getModels;

module.exports = {
    identity: 'comment',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {

        thesis: {
            model: 'thesis'
        },

        reviewer: {
            model: 'lecturer'
        },

        content: {
            type: 'string',
            required: true
        }

    }
};