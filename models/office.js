var getModel = require('express-waterline').getModels;
var _ = require('underscore');

module.exports = {
    identity: 'office',
    connection: 'mongo',
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
        // rebuild all tree


        getModel('office').then(function (Office) {
            if (values.name == 'root') {
                Office.findOne({
                    name: 'root'
                }).exec(function (error, root) {
                    if (error) {
                        return next(error);
                    }

                    if (root) {
                        return next({
                            message: 'Root exits.'
                        })
                    }

                    values.left = 1;
                    values.right = 2;
                    next();
                })
            } else {
                Office.findOne({
                    id: values.parentId
                }).exec(function (error, parent) {
                    values.left = parent.right;
                    values.right = parent.right + 1;
                    parent.right = parent.right + 2;
                    parent.save(function (error) {
                        if (error) {
                            return next(error);
                        }

                        Office.update(
                            {
                                left: {
                                    '>=': values.right
                                }
                            },
                            {
                                left: left + 2
                            }
                        ).exec(function (error, updated) {
                            if (error) {
                                return next(error);
                            }

                            Office.update(
                                {
                                    right: {
                                        '>=': values.right
                                    }
                                },
                                {
                                    right: right + 2
                                }
                            ).exec(function (error, updated) {
                                if (error) {
                                    return next(error);
                                }

                                next();
                            })
                        })
                    });
                })
            }
        })
    }
}
;