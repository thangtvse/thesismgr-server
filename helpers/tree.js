/*
 * Project: ThesisMgr-Server
 * File: helpers\tree.js
 */

var getModel = require('express-waterline').getModels;

/**
 * Find ancestors and descendants for an office node
 * @param office
 * @param next
 */
exports.findAncestorsAndDescendantsForOffice = function (office, next) {

    getModel('office').then(function (Office) {
       return findAncestorsAndDescendants(Office, office, next);
    });
};

/**
 * Find ancestors and descendants for a field node
 * @param field
 * @param next
 */
exports.findAncestorsAndDescendantsForField = function (field, next) {

    getModel('field').then(function (Field) {
        return findAncestorsAndDescendants(Field, field, next);
    });
};

/**
 * find ancestors and descendants for a node in a collection that implements nested set
 * @param Model
 * @param node
 * @param next
 */
var findAncestorsAndDescendants = function (Model, node, next) {
    Model.find({
        left: {
            '<': node.left
        },
        right: {
            '>': node.right
        }
    }).exec(function (error, descendants) {

        if (error) {
            return next(error, null, null);
        }

        Model.find({
            left: {
                '>': node.left
            },
            right: {
                '<': node.right
            }
        }).exec(function (error, ancestors) {
            if (error) {
                return next(error, null, null);
            }

            return next(null, sortNodeByLeft(ancestors), sortNodeByLeft(descendants));
        });
    })
};

/**
 * Sort a set of nodes by left value
 * @param nodes
 * @returns {Query|Aggregate|*|Array.<T>}
 */
var sortNodeByLeft = function (nodes) {
    var condition = function (first, second) {
        return first.lft - second.lft
    };
    return nodes.sort(condition);
};

exports.sortNodeByLeft = sortNodeByLeft;

/**
 * Function for execute before creating a node in nested set
 * @param Model
 * @param values
 * @param next
 */
exports.beforeCreateANode = function (Model, values, next) {
    Model.findOne({
        name: 'root'
    }).exec(function (error, root) {
        if (error) {
            return next(error);
        }

        if (values.name == 'root') {
            // Can't create more root
            if (root) {
                return next({
                    message: 'Root exits.'
                })
            } else {
                // Create root
                return next();
            }
        } else {
            // Create a not-root node. Assume that we've got a root, if not, return an internal error
            if (root == null) {
                console.log("Error: No root");
                return next({
                    message: "Error: No root"
                })
            }

            // If no parentId was defined, set it to root id
            if (values.parentId == null) {
                values.parentId = root.id
            }

            Model.findOne({
                id: values.parentId
            }).exec(function (error, parent) {
                values.left = parent.right;
                values.right = parent.right + 1;
                parent.right = parent.right + 2;
                parent.save(function (error) {
                    if (error) {
                        return next(error);
                    }

                    Model.update(
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

                        Model.update(
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
};
