var getModel = require('express-waterline').getModels;

module.exports = {
    identity: 'thesis',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        student: {
            model: 'student',
            required: true
        },

        lecturer: {
            model: 'lecturer',
            required: true
        },

        topic: {
            type: 'string',
            required: true
        },

        fields: {
            collection: 'field',
            via: 'lecturers'
        },

        description: {
            type: 'text',
            required: true
        },

        status: {
            type: 'integer',
            min: 1,
            max: 11
        },

        files: {
            collection: 'file',
            via: 'thesis'
        },

        session: {
            model: 'session'
        },

        council: {
            model: 'council'
        },

        dateOfProtection: {
            type: 'date'
        },

        comments: {
            collection: 'comment',
            via: 'thesis'
        },

        result: {
            type: 'float'
        },

        editingExplanations: {
            collection: 'editingExplanation',
            via: 'thesis'
        }

    }
};