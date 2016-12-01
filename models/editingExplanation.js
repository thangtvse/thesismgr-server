var getModel = require('express-waterline').getModels;

module.exports = {
    identity: 'editingExplanation',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },

        files: {
            collection: 'file'
        },

        thesis: {
            model: 'thesis',
            required: true
        },

        creator: {
            model: 'lecturer',
            required: true
        }
    }
};