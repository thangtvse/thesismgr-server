/*
 * Project: ThesisMgr-Server
 * File: helpers\tree.js
 */

var getModel = require('express-waterline').getModels;
var sanitizeHtml = require('sanitize-html');
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

var createNode = function (node) {
    return "<li>" + node.name + "<ul>";
};

exports.createTree = function (nodes) {

    nodes = [
        {
            name: 'root',
            left: 1,
            right: 24
        },
        {
            name: 'Nam',
            left: 2,
            right: 9
        },
        {
            name: 'Mau',
            left: 3,
            right: 8
        },
        {
            name: 'Thuy',
            left: 4,
            right: 5
        },
        {
            name: 'Luyen',
            left: 6,
            right: 7
        },
        {
            name: 'Ha',
            left: 10,
            right: 21
        },
        {
            name: 'Long',
            left: 11,
            right: 12
        }
    ];

    var htmlNodes = [];

    for (var i = 0; i < nodes.length; i++) {

        htmlNodes[i] = "";

        if (i == 0) {
            // first node
            htmlNodes[i] = htmlNodes[i].concat("<ul>");
        } else {

            for (var j = i - 1; j >= 0; j--) {

                if (nodes[i].left > nodes[j].left && nodes[i].left < nodes[j].right) {
                    // if current node is a child of this node
                    htmlNodes[i] = htmlNodes[i].concat(createNode(nodes[i]));
                    break;
                } else {
                    // if current node is not a child of this node, close the <ul> tag of this node
                    if (htmlNodes[j].indexOf("</ul>") == -1) {
                        htmlNodes[i] = htmlNodes[i].concat("</ul></li>");
                    }
                }
            }
        }
    }

    var htmlString = "";
    htmlNodes.forEach(function (htmlNode) {
        htmlString = htmlString.concat(htmlNode);
    });

    htmlString = sanitizeHtml(htmlString);
    htmlString = htmlString.replace(new RegExp("<ul></ul>", 'g'), "");
    return htmlString;
};