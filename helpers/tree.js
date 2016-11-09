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
