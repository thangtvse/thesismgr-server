var getModel = require('express-waterline').getModels;
var treeHelper = require('../../helpers/tree');
var util = require('util');


/**
 * Get a view for presenting categories of defined type
 * @param type
 * @returns {Function}
 */
exports.getView = function (type) {
    return function (req, res) {
        getModel(type).then(function (Field) {
            Field.find().exec(function (error, fields) {
                if (error) {
                    console.log(error);
                    req.flash('errorMessage', error.message);
                    return res.redirect('/admin/categories/' + type + 's');
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
                data.req = req;

                return res.render('./admin/categories/' + type + 's', data)

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
            req.flash('errorMessage', "Field name must not be null.");
            return res.redirect('/admin/categories/' + type + 's');
        }

        if (type == 'unit' && req.body.type == null) {
            // If this is a unit so it must have a type
            req.flash('errorMessage', 'Type must not be null');
            return res.redirect('/admin/categories/' + type + 's');
        }

        console.log("creating field: " + fieldName + " with parent id: " + parentFieldID);

        if (parentFieldID == null) {
            console.log("parent id is null");
        }

        getModel(type).then(function (Field) {

            var attributes = {
                name: fieldName,
                parentId: parentFieldID
            };

            if (type == 'unit') {
                attributes['type'] = req.body.type;
            }

            Field.create(attributes).exec(function (error, newField) {
                if (error) {
                    console.log(error);
                    req.flash('errorMessage', error.message);
                    return res.redirect('/admin/categories/' + type + 's');
                }

                return res.redirect("admin/categories/" + type + "s");
            })
        })
    }
};

/**
 * Delete a category
 * @param type
 * @returns {Function}
 */
exports.delete = function (type) {
    return function (req, res) {
        var id = req.query.id;

        if (id == null) {
            console.log("Null field id");
            res.render('/partials/404');
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
                        req.flash('errorMessage', error.message);
                        return res.redirect('/admin/categories/' + type + 's');
                    }

                    treeHelper.afterDestroyANode(Field, left, right, function (error) {
                        if (error) {
                            console.log(error);
                            req.flash('errorMessage', error.message);
                        }

                        return res.redirect('/admin/categories/' + type + 's');
                    });


                })
            });

        })
    }
};

/**
 * Update name for a category
 * @param type
 * @returns {Function}
 */
exports.update = function (type) {
    return function (req, res) {

        req.checkBody('id', 'Invalid ID').notEmpty();
        req.checkBody('name', 'Invalid Name').notEmpty();

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errorMessage', errors[0].msg);
            return res.redirect('/admin/categories/' + type + 's');
        }

        getModel(type).then(function (Category) {
            Category.update({
                    id: req.body.id
                },
                {
                    name: req.body.name
                }).exec(function (error, updated) {
                if (error) {
                    req.flash('errorMessage', error.message);
                }

                return res.redirect('/admin/categories/' + type + 's');
            })
        })

    }
};


