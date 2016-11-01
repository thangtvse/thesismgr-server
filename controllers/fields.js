/*
 * Project: ThesisMgr-Server
 * File: controllers\Fields.js
 */

var Field = require('../models/Field');
var createResponse = require('../helpers/response').createRes;
var mongoose = require('mongoose');
var findAncestorsAndDescendants = require('../helpers/tree').findAncestorsAndDescendants;

/**
 * Get a list all all field in database
 */
exports.getAllFields = function (req, res) {
    Field.find(function (err, fields) {
        if (err) {
            return res.status(500).send(createResponse(false, null, err.message));
        }

        return res.send(createResponse(true, fields, null));
    })
}

/**
 * Find a field by its ID
 */
exports.getFieldById = function (req, res) {
    var id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(createResponse(false, null, "Field not found."));
    }

    Field.findById(id, function (err, field) {
        if (err) {
            return res.status(500).send(createResponse(false, null, err.message));
        }

        if (!field) {
            return res.status(404).send(createResponse(false, null, "Field not found."));
        }

        findAncestorsAndDescendants(field, function (err, ancestors, descendants) {
            if (err) {
                return res.status(500).send(createResponse(false, null, err.message));
            }

            return res.send(
                createResponse(true, {
                    field: field,
                    ancestors: ancestors,
                    descendants: descendants
                }, null));
        })
    })
}

/**
 * Search a field by its name
 */
exports.searchField = function (req, res) {
    var searchText = req.query.text;

    Field.find({
        // Case-insensitive finding - Slow
        name: { "$regex": searchText, "$options": "i" }
    }, function (err, fields) {

        var data = [];

        console.log('length: ' + fields.length);

        if (fields.length > 0) {
            fields.forEach(function (field) {
                findAncestorsAndDescendants(field, function (err, ancestors, descendants) {

                    if (err) {
                        return res.status(500).send(createResponse(false, null, err.message));
                    }

                    data.push({
                        field: field,
                        ancestors: ancestors,
                        descendants: descendants
                    })

                    if (data.length == fields.length) {
                        return res.send(createResponse(true, data, null));
                    }
                })
            });
        } else {
            return res.send(createResponse(true, data, null));
        }
    })
}

/**
 * Add a new field to the database
 */
exports.postField = function (req, res) {

    var fieldName = req.body.name;
    var parentFieldID = req.body.parent_id;

    if (!fieldName) {
         return res.status(400).send(createResponse(false, null, "Field name must not be null."));
    }

    if (parentFieldID) {
        Field.findById(parentFieldID, function (err, parentField) {
            if (err) {
                console.log(err);
                return res.status(500).send(createResponse(false, null, err.message));
            }

            if (parentField) {
                var field = new Field({
                    name: fieldName,
                    parentId: parentFieldID
                })

                // save new fiew with parentId
                field.save(function (err) {
                    if (err) {
                        return res.status(500).send(createResponse(false, null, err.message));
                    }

                    // find root field and rebuild tree
                    Field.find({
                        parentId: null
                    }, function (err, roots) {
                        if (err) {
                            return res.status(500).send(createResponse(false, null, err.message));
                        }

                        // something wrong because we must have at least root in this case
                        if (roots.length == 0) {
                            return res.status(500).send(createResponse(false, null, "Server internal error: No root field."));
                        }

                        // rebuild trees
                        for (var pos = 0; pos < roots.length; pos++) {
                            (function (pos) {
                                Field.rebuildTree(roots[pos], 1, function () {
                                    if (pos == roots.length - 1) {
                                        return res.send(createResponse(true, field, null))
                                    }
                                })
                            })(pos);
                        }
                    })
                })
            } else {
                return res.send(createResponse(false, null, "Parent not found."));
            }

        })
    } else {
        var field = new Field({
            name: fieldName
        })

        field.save(function (err) {
            if (err) {
                return res.status(500).send(createResponse(false, null, err.message));
            }

            Field.rebuildTree(field, 1, function () {

                return res.send(createResponse(true, field, null))

            })
        })
    }
}
