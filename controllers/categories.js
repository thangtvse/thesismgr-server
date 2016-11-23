var getModel = require('express-waterline').getModels;
var treeHelper = require('../helpers/tree');
var util = require('util');


exports.getView = function (type) {
    return function (req, res) {
        getModel(type).then(function (Field) {
            Field.find().exec(function (error, fields) {
                if (error) {
                    console.log(error);
                    return req.flash('errorMessage', error.message);
                }

                var sortedFields = treeHelper.sortNodeByLeft(fields);


                var filteredFields = sortedFields.filter(function (field) {
                    if (field.left == 1) {
                        return false;
                    } else {
                        return true;
                    }
                });

                var kHierarchy = type + "_hierarchy";
                var kCategories = type + "s";

                console.log(kHierarchy);

                var data = {};
                data[kHierarchy] = treeHelper.createTree(sortedFields);
                data[kCategories] = filteredFields;
                data['message'] =  req.flash('errorMessage');

                return res.render('./categories/' + type + 's', data)

            })
        })
    }
};

/**
 * Add a new field to the database
 */
exports.post = function (type) {
    return function (req, res) {

        var fieldName = req.body.name;
        var parentFieldID = null;
        if (req.body.parent_id != "") {
            parentFieldID = req.body.parent_id;
        }


        if (!fieldName) {

            return req.flash('errorMessage', "Field name must not be null.");

        }

        console.log("creating field: " + fieldName + " with parent id: " + parentFieldID);

        if (parentFieldID == null) {
            console.log("parent id is null");
        }

        getModel(type).then(function (Field) {
            Field.create({
                name: fieldName,
                parentId: parentFieldID
            }).exec(function (error, newField) {
                if (error) {
                    console.log(error);
                    return req.flash('errorMessage', error.message);
                }

                return res.redirect("/categories/" + type + "s");
            })
        })
    }
};

exports.delete = function (type) {
    return function (req, res) {
        var id = req.query.id;

        if (id == null) {
            console.log("Null field id");
            res.render('/patrials/404');
        }


        getModel(type).then(function (Field) {

            Field.findOne({
                id: id
            }).exec(function (error, removedField) {

                var left = removedField.left;
                var right = removedField.right;

                Field.destroy({
                    id: id
                }).exec(function (error) {

                    if (error) {
                        console.log(error);
                        return req.flash('errorMessage', error.message);
                    }

                    treeHelper.afterDestroyANode(Field, left, right, function (error) {
                        if (error) {
                            console.log(error);
                            return req.flash('errorMessage', error.message);
                        }

                        return res.redirect('/categories/' + type + 's');
                    });


                })
            });

        })
    }
};