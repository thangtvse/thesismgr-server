/*
 * Project: ThesisMgr-Server
 * File: helpers\tree.js
 */

/**
 * Helper function for find both ancestors and descendents of a given field
 * 
 * @param node Given node
 * @param {function(Error, [], [])}next Callback function
 */
exports.findAncestorsAndDescendants = function (node, next) {
    node.descendants(function (err, descendants) {
        if (err) {
            return next(err, null, null);
        }

        node.ancestors(function (err, ancestors) {
            if (err) {
                return next(err, null, null);
            }

            var condition = function (first, second) {
                return first.lft - second.lft
            }
            var sortedAncestors = ancestors.sort(condition);
            var sortedDescendants = descendants.sort(condition);

            return next(null, sortedAncestors, sortedDescendants);
        });
    })
};

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
