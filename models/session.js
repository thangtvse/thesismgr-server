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
    },

    getAllAvailableSessions: function (next) {

        var currentDate = new Date();

        getModel('session').then(function (Session) {
            Session.find({
                from: {
                    '<=': currentDate
                },

                to: {
                    '>=': currentDate
                }
            })
                .populate('faculty')
                .exec(function (error, sessions) {
                    return next(error, sessions);
                })
        })
    }
};