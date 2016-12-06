var treeHelper = require('../helpers/tree');
var async = require('async');
var getModel = require('express-waterline').getModels;

exports.getNavTree = function (req, res, next) {
    async.parallel([
        function (callback) {
            getTree("unit", function (error, tree) {
                if (error) {
                    return callback(error);
                }

                req.unitTree = tree;
                return callback();
            })
        },
        function (callback) {
            getTree("field", function (error, tree) {
                if (error) {
                    return callback(error);
                }
                req.fieldTree = tree;

                return callback();
            })
        }
    ], function (errors) {
        if (errors && errors.length > 0) {
            req.flash("errorMessage", errors[0].message);
            return res.redirect("./index");
        }

        return next();

    });
};


var getTree = function (type, next) {
    getModel(type).then(
        function (Field) {
            Field.find().exec(function (error, fields) {
                if (error) {
                    return next(error);
                }

                var sortedFields = treeHelper.sortNodeByLeft(fields);


                return next(null, treeHelper.createNavTree(type, sortedFields));
            })
        }
    )
};