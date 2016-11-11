/*
 * Project: ThesisMgr-Server
 * File: controllers\offices.js
 */


var getModels = require('express-waterline').getModels;
var createResponse = require('../helpers/response').createRes;
var treeHelper = require('../helpers/tree');
var findAncestorsAndDescendants = treeHelper.findAncestorsAndDescendantsForOffice;
var sortNodesByLeft = treeHelper.sortNodeByLeft;

/**
 * Get a list all office in database
 */
exports.getAllOffices = function (req, res) {

    getModels('office').then(function (Office) {
        Office.find(function (err, offices) {
            if (err) {
                return res.status(500).send(createResponse(false, null, err.message));
            }

            return res.send(createResponse(true, sortNodesByLeft(offices), null));
        })
    });
};

/**
 * Find an office by its ID
 */
exports.getOfficeById = function (req, res) {
    var id = req.params.id;

    getModels('office').then(function (Office) {

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
    })
};

/**
 * Search an office by its name
 */
exports.searchOffice = function (req, res) {
    var searchText = req.query.text;

    getModels('office').then(function (Office) {
        Office.find({
            // Case-insensitive finding - Slow
            name: {"$regex": searchText, "$options": "i"}
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
                        });

                        if (data.length == offices.length) {
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
 * Add a new office to the database
 */
exports.postOffice = function (req, res) {
    var officeName = req.body.name;
    var parentOfficeId = req.body.parent_id;

    getModels('office').then(function (Office) {

        Office.create({
            name: officeName,
            parent: parentOfficeId
        }).exec(function (error, newOffice) {
            if (error) {
                return res.status(500).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, newOffice, null))
        })
    });
};
