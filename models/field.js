var getModel = require('express-waterline').getModels;
var _ = require('underscore');

module.exports = {
    identity: 'field',
    connection: 'mongo',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },

        parent: {
            model: 'field'
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
            via: 'fields'
        }
    },
    beforeCreate: function(values, next){
        // rebuild all tree
        getModel('field').then(function (Field) {
            if (values.name == 'root') {
                Field.findOne({
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
                Field.findOne({
                    id: values.parentId
                }).exec(function (error, parent) {
                    values.left = parent.right;
                    values.right = parent.right + 1;
                    parent.right = parent.right + 2;
                    parent.save(function (error) {
                        if (error) {
                            return next(error);
                        }

                        Field.update(
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

                            Field.update(
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
};