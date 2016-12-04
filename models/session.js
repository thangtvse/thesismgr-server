var getModel = require('express-waterline').getModels;

module.exports = {
    identity: 'session',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },

        from: {
            type: 'date',
            required: true
        },

        to: {
            type: 'date'
        },

        theses: {
            collection: 'thesis',
            via: 'session'
        },

        faculty: {
            model: 'unit',
            required: true
        }

    }
};