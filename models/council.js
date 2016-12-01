var getModel = require('express-waterline').getModels;

module.exports = {
    identity: 'council',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        members: {
            collection: 'lecturer',
            via: 'councils'
        },

        chairman: {
            model: 'lecturer',
            required: true
        },

        secretary: {
            model: 'lecturer',
            required: true
        },

        theses: {
            collection: 'thesis',
            via: 'council'
        },

        session: {
            model: 'session',
            required: true
        }
    }
};