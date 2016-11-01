/*
 * Project: ThesisMgr-Server
 * File: controllers\offices.js
 */


var Office = require('../models/Office');
var createResponse = require('../helpers/response').createRes;
var mongoose = require('mongoose');
var findAncestorsAndDescendants = require('../helpers/tree').findAncestorsAndDescendants;

/**
 * Get a list all office in database
 */
exports.getAllOffices = function (req, res) {
    Office.find(function (err, offices) {
        if (err) {
            return res.status(500).send(createResponse(false, null, err.message));
        }

        return res.send(createResponse(true, offices, null));
    })
}

/**
 * Find an office by its ID
 */
exports.getOfficeById = function (req, res) {
    var id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(createResponse(false, null, "Office not found."));
    }

    Office.findById(id, function (err, office) {
        if (err) {
            return res.status(500).send(createResponse(false, null, err.message));
        }

        if (!office) {
            return res.status(404).send(createResponse(false, null, "Office not found."));
        }

        findAncestorsAndDescendants(office, function (err, ancestors, descendants) {
            if (err) {
                return res.status(500).send(createResponse(false, null, err.message));
            }

            return res.send(
                createResponse(true, {
                    office: office,
                    ancestors: ancestors,
                    descendants: descendants
                }, null));
        })
    })
}

/**
 * Search an office by its name
 */
exports.searchOffice = function (req, res) {
    var searchText = req.query.text;

    Office.find({
        // Case-insensitive finding - Slow
        name: { "$regex": searchText, "$options": "i" }
    }, function (err, offices) {

        var data = [];

        console.log('length: ' + offices.length);

        if (offices.length > 0) {
            offices.forEach(function (office) {
                findAncestorsAndDescendants(office, function (err, ancestors, descendants) {

                    if (err) {
                        return res.status(500).send(createResponse(false, null, err.message));
                    }

                    data.push({
                        office: office,
                        ancestors: ancestors,
                        descendants: descendants
                    })

                    if (data.length == offices.length) {
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
 * Add a new office to the database
 */
exports.postOffice = function (req, res) {
    var officeName = req.body.name;
    var parentOfficeId = req.body.parent_id;

    if (parentOfficeId) {
        Office.findById(parentOfficeId, function (err, parentOffice) {
            if (err) {
                console.log(err);
                return res.status(500).send(createResponse(false, null, err.message));
            }

            if (parentOffice) {
                var office = new Office({
                    name: officeName,
                    parentId: parentOfficeId
                })

                // save new fiew with parentId
                office.save(function (err) {
                    if (err) {
                        return res.status(500).send(createResponse(false, null, err.message));
                    }

                    // find root office and rebuild tree
                    Office.findOne({
                        parentId: null
                    }, function (err, root) {
                        if (err) {
                            return res.status(500).send(createResponse(false, null, err.message));
                        }

                        Office.rebuildTree(root, 1, function () {
                            return res.send(createResponse(true, office, null));
                        })
                    })
                })
            } else {
                return res.send(createResponse(false, null, "Parent not found."));
            }

        })
    } else {
        var office = new Office({
            name: officeName
        })

        office.save(function (err) {
            if (err) {
                return res.status(500).send(createResponse(false, null, err.message));
            }

            return res.send(createResponse(true, office, null));
        })
    }
}
