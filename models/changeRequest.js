var getModel = require('express-waterline').getModels;
var thesisStatus = require('../config/thesisStatus');
var async = require('async');
var objectUtil = require('../helpers/object');
var paginationConfig = require('../config/pagination');
var _ = require('underscore');

module.exports = {
    identity: 'change',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        student: {
            model: 'student',
            required: true
        },

        lecturer: {
            model: 'lecturer',
            required: true
        },

        title: {
            type: 'string',
            required: true
        },

        fields: {
            collection: 'field',
            via: 'changes'
        },

        faculty: {
            model: 'unit',
            required: true
        },

        description: {
            type: 'text',
            required: true
        },

        status: {
            type: 'integer',
            min: 1,
            max: 19,
            required: true
        },

        files: {
            collection: 'file',
            via: 'thesis'
        },

        session: {
            model: 'session',
            required: true
        },

        council: {
            model: 'council'
        },

        dateOfProtection: {
            type: 'date'
        },

        result: {
            type: 'float'
        }
    }
};