/*
 * Project: ThesisMgr-Server
 * File: helpers\tree.js
 */

var getModel = require('express-waterline').getModels;
var sanitizeHtml = require('sanitize-html');
var util = require('util');
var async = require("async");

/**
 * Find ancestors and descendants for an unit node
 * @param unit
 * @param next
 */
exports.findAncestorsAndDescendantsForUnit = function (unit, next) {
    getModel('unit').then(function (Unit) {
        return findAncestorsAndDescendants(Unit, unit, next);
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
    }).exec(function (error, ancestors) {

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
        }).exec(function (error, descendants) {
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
        return first.left - second.left
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

                if (error) {
                    return next(error);
                }

                values.left = parent.right;
                values.right = parent.right + 1;
                parent.save(function (error) {
                    if (error) {
                        console.log(error);
                        return next(error);
                    }

                    Model.find(
                        {
                            left: {
                                '>=': values.left
                            }
                        }
                    ).exec(function (error, fields) {
                        if (error) {
                            console.log(error);
                            return next(error);
                        }

                        async.each(fields,
                            function (field, callback) {
                                field.left = field.left + 2;
                                field.save(function (error) {
                                    return callback(error);
                                });
                            }, function (error) {

                                if (error) {
                                    console.log(error);
                                    return next(error);
                                }

                                Model.find(
                                    {
                                        right: {
                                            '>=': values.left
                                        }
                                    }
                                ).exec(function (error, fields) {
                                    if (error) {
                                        console.log(error);
                                        return next(error);
                                    }

                                    async.each(fields,
                                        function (field, callback) {
                                            field.right = field.right + 2;
                                            field.save(function (error) {
                                                callback(error);
                                            });
                                        }, function (error) {

                                            if (error) {
                                                console.log(error);
                                                return next(error);
                                            }

                                            return next()
                                        });
                                })
                            });
                    })
                });
            })
        }

    })
};

exports.afterDestroyANode = function (Model, left, right, next) {
    // find all descendants

    Model.find({
        left: {
            ">": left
        },
        right: {
            "<": right
        }
    }).exec(function (error, descendants) {

        if (error) {
            console.log(error);
            return next(error);
        }

        var numOfRemovedNodes = descendants.length + 1;

        Model.destroy({
            left: {
                ">": left
            },
            right: {
                "<": right
            }
        }).exec(function (error) {
            if (error) {
                console.log(error);
                return next(error);
            }

            // update left and right
            Model.find({
                left: {
                    ">": right
                }
            }).exec(function (error, nodes) {
                if (error) {
                    console.log(error);
                    return next(error);
                }

                console.log("updating left >" + right);

                async.each(nodes,
                    function (node, callback) {

                        console.log("updating:");
                        console.log(util.inspect(node));

                        node.left = node.left - numOfRemovedNodes * 2;
                        node.save(function (error) {
                            if (error) {
                                console.log(error);
                                return callback(error);
                            }

                            callback();
                        })
                    }, function (error) {

                        console.log("updated");

                        if (error) {
                            console.log(error);
                            return next(error);
                        }

                        Model.find({
                            right: {
                                ">": right
                            }
                        }).exec(function (error, nodes) {
                            if (error) {
                                console.log(error);
                                return next(error);
                            }

                            console.log("updating right >" + right);

                            async.each(nodes,
                                function (node, callback) {
                                    node.right = node.right - numOfRemovedNodes * 2;
                                    node.save(function (error) {
                                        if (error) {
                                            console.log(error);
                                            return callback(error);
                                        }

                                        callback();
                                    })
                                }, function (error) {
                                    if (error) {
                                        console.log(error);
                                        return next(error);
                                    }

                                    return next();

                                })
                        })
                    })
            })
        })

    })
};

var createNode = function (node) {

    if (node.type != null) {
        return "<li style='list-style-type: none'><div class=\"panel panel-default category-item type-" + node.type + "\"><div class=\"panel-body\">" + node.name + editButton(node) + deleteButton(node) + "</div></div><ul>";
    } else {
        return "<li style='list-style-type: none'><div class=\"panel panel-default category-item\"><div class=\"panel-body\">" + node.name + editButton(node) + deleteButton(node) + "</div></div><ul>";
    }

};

var createLeaf = function (node) {
    return createNode(node);
};

var editButton = function (node) {
    return "<a style='position: absolute; right: 60px' href=\"#\" data-action=\"edit\" data-id=\"" + node.id + "\" class=\"category-item edit\">  Edit </a>"
};

var deleteButton = function (node) {
    return "<a style='position: absolute; right: 10px;' href=\"#\" data-action=\"delete\" data-id=\"" + node.id + "\" class=\"category-item delete\">Delete </a>"
};

exports.createTree = function (nodes) {

    var htmlNodes = [];

    for (var i = 0; i < nodes.length; i++) {

        htmlNodes[i] = "";

        if (i == 0) {
            // first node
            htmlNodes[i] = htmlNodes[i].concat("<ul style='list-style-type: none; padding-left: 0px'>");
        } else {

            for (var j = i - 1; j >= 0; j--) {

                if (nodes[i].left > nodes[j].left && nodes[i].left < nodes[j].right) {
                    // if current node is a child of this node

                    var numOfChild = 0;

                    nodes.forEach(function (node) {
                        if (node.left > nodes[i].left && node.right < nodes[i].right) {
                            numOfChild++;
                        }
                    });

                    if (numOfChild > 0) {
                        htmlNodes[i] = htmlNodes[i].concat(createNode(nodes[i]));
                    } else {
                        htmlNodes[i] = htmlNodes[i].concat(createLeaf(nodes[i]));
                    }

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


    htmlString = sanitizeHtml(htmlString, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['input', 'label']),
        allowedAttributes: false
    });

    htmlString = htmlString.replace(new RegExp("<ul></ul>", 'g'), "");

    return htmlString;
};

exports.createTree2 = function (nodes) {

    var htmlNodes = [];
    for (var i = 0; i < nodes.length; i++) {

        htmlNodes[i] = "";
        if (i == 0) {
            // first node
            // htmlNodes[i] = htmlNodes[i].concat("<ul>");
        } else {

            for (var j = i - 1; j >= 0; j--) {

                if (nodes[i].left > nodes[j].left && nodes[i].left < nodes[j].right) {
                    // if current node is a child of this node

                    var numOfChild = 0;

                    nodes.forEach(function (node) {
                        if (node.left > nodes[i].left && node.right < nodes[i].right) {
                            numOfChild++;
                        }
                    });

                    if (numOfChild > 0) {
                        htmlNodes[i] = htmlNodes[i].concat(createNode2(nodes[i]));
                    } else {
                        htmlNodes[i] = htmlNodes[i].concat(createLeaf2(nodes[i]));
                    }

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


    htmlString = sanitizeHtml(htmlString, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['input', 'label']),
        allowedAttributes: false
    });

    htmlString = htmlString.replace(new RegExp("<ul></ul>", 'g'), "");

    return htmlString;
};

var createNode2 = function (node) {
    return "<li style='padding-left: 15px;'><a href=\"#\" data-id='"+node.id+"' onclick='getData();'><i class=\"fa arrow\"></i> "+ node.name +"<span class=\"fa \"></span></a><ul class='nav'>";
};
var createLeaf2 = function (node) {
    return "<li style='padding-left: 15px;'><a href='#' data-id='"+node.id+"'><i class=\"fa minus\"></i>" + node.name + "</a><ul>";
};