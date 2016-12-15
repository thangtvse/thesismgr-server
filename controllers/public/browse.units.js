var getModel = require('express-waterline').getModels;
var paginationConfig = require('../../config/pagination');
var _ = require('underscore');
var treeHelper = require('../../helpers/tree');
var async = require('async');

/**
 * Xem một đơn vị
 * @param req
 * @param res
 */
exports.getUnitView = function (req, res) {

    getModel('unit').then(function (Unit) {
        Unit.findOne({
            urlName: req.params.slug
        }).exec(function (error, unit) {
            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/units');
            }

            if (!unit) {
                req.flash('errorMessage', 'Unit not found.');
                return res.redirect('/units');
            }

            getModel('user').then(function (User) {
                User.count({
                    role: ["lecturer", ["moderator"]],
                    unit: unit.id
                }).exec(function (error, numOfLecturers) {
                    if (error) {
                        req.flash('errorMessage', error.message);
                        return res.redirect('/units');
                    }

                    var numberOfPages;
                    if (numOfLecturers % paginationConfig.numberOfUsersPerPage == 0) {
                        numberOfPages = Math.floor(numOfLecturers / paginationConfig.numberOfUsersPerPage);
                    } else {
                        numberOfPages = Math.floor(numOfLecturers / paginationConfig.numberOfUsersPerPage) + 1;
                    }

                    return res.render('./public/browse/lecturers_by_unit', {
                        req: req,
                        message: req.flash('errorMessage'),
                        unit: unit,
                        numberOfPages: numberOfPages
                    });
                })
            });

        })
    })
};

/**
 * Xem tất cả các đơn vị
 * @param req
 * @param res
 */
exports.getView = function (req, res) {
    getModel('unit').then(function (Unit) {
        Unit.getAllUnits(function (error, units) {
            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/units');
            }

            var trees = {};

            _.forEach(units, function (unit) {


                if (unit.type == 'faculty'){
                    var nodes = units.filter(function (node) {
                        return (node.left >= unit.left && node.right <= unit.right);
                    });

                    nodes = treeHelper.sortNodeByLeft(nodes);

                    trees[unit.urlName] = treeHelper.createUnitTreeNoButton(nodes);
                }
            });


            return res.render('./public/browse/units', {
                req: req,
                message: req.flash('errorMessage'),
                units: units,
                trees: trees
            });
        })
    })
};