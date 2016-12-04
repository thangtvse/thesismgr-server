var getModel = require('express-waterline').getModels;
var treeHelper = require('../helpers/tree');
var util = require('util');
var async = require('async');

exports.getView =function() {
    return function (req, res) {
        var data = {};
        data['title'] = "Filter";
        async.parallel([
            function (callback) {
                getTree("unit", function (error, tree) {
                    if (error) {
                        return callback(error);
                    }
                    data['units'] = tree;
                    return callback();
                })
            },
            function (callback) {
                getTree("field", function (error, tree) {
                    if (error) {
                        return callback(error);
                    }
                    data['fields'] = tree;
                    return callback();
                })
            }
        ], function (errors) {
            if (errors && errors.length > 0) {
                req.flash("errorMessage", errors[0].message);
                return res.redirect("./index");
            }

            return res.render("./search/categories.filter.ejs",data)

        });
    };
};


var getTree = function (type, next) {
    getModel(type).then(
        function (Field) {
            Field.find().exec(function (error, fields) {
                if (error) {
                    return next(error);
                }

                var sortedFields = treeHelper.sortNodeByLeft(fields);


                var filteredFields = sortedFields.filter(function (field) {
                    if (field.left == 1) {
                        return false;
                    } else {
                        return true;
                    }
                });
                return next(null, treeHelper.createTree2(sortedFields));
            })
        }
    )
};
