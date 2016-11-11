/*
 * Project: ThesisMgr-Server
 * File: controllers\Fields.js
 */

var getModels = require('express-waterline').getModels;
var createResponse = require('../helpers/response').createRes;
var treeHelper = require('../helpers/tree');
var findAncestorsAndDescendants = treeHelper.findAncestorsAndDescendantsForOffice;
var sortNodesByLeft = treeHelper.sortNodeByLeft;

/**
 * Get a list all all field in database
 */
exports.getAllFields = function (req, res) {
    getModels('field').then(function (Field) {
        Field.find(function (err, fields) {
            if (err) {
                return res.status(500).send(createResponse(false, null, err.message));
            }


            return res.send(createResponse(true, sortNodesByLeft(fields), null));
        })
    })
};

/**
 * Find a field by its ID
 */
exports.getFieldById = function (req, res) {
    var id = req.params.id;

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //     return res.status(404).send(createResponse(false, null, "Field not found."));
    // }

    getModels('field').then(function (Field) {
        Field.findOne({id: id}, function (err, field) {
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
    })
};

/**
 * Search a field by its name
 */
exports.searchField = function (req, res) {
    var searchText = req.query.text;

    getModels('field').then(function (Field) {
        Field.find({
            // Case-insensitive finding - Slow
            name: {"$regex": searchText, "$options": "i"}
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
                        });

                        if (data.length == fields.length) {
                            return res.send(createResponse(true, data, null));
                        }
                    })
                });
            } else {
                return res.send(createResponse(true, data, null));
            }
        })
    })
};

/**
 * Add a new field to the database
 */
exports.postField = function (req, res) {

    var fieldName = req.body.name;
    var parentFieldID = req.body.parent_id;

    if (!fieldName) {
        return res.status(400).send(createResponse(false, null, "Field name must not be null."));
    }

    getModels('field').then(function (Field) {
        Field.create({
            name: fieldName,
            parent: parentFieldID
        }).exec(function (error, newField) {
            if (error) {
                return res.status(500).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, newField, null))
        })
    })
};



