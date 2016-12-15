var getModel = require('express-waterline').getModels;
var treeHelper = require('../../helpers/tree');
var paginationConfig = require('../../config/pagination');

/**
 * Lấy về view xem toàn bộ lĩnh vực nghiên cứu
 * @param req
 * @param res
 */
exports.getView = function (req, res) {
    getModel('field').then(function (Field) {
        Field.find().exec(function (error, fields) {
            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/fields');
            }

            var sortedNodes = treeHelper.sortNodeByLeft(fields);

            return res.render('./public/browse/fields', {
                req: req,
                message: req.flash('errorMessage'),
                fieldTree: treeHelper.createFieldTreeWithLecturersButton(sortedNodes)
            });
        })
    });
};

/**
 * Lấy về view xem một lĩnh vực nghiên cứu
 * @param req
 * @param res
 */
exports.getFieldView = function (req, res) {

    getModel('field').then(function (Field) {
        Field.findOne({
            urlName: req.params.slug
        }).exec(function (error, field) {
            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/fields');
            }

            if (!field) {
                req.flash('errorMessage', 'Field not found.');
                return res.redirect('/fields');
            }

            getModel('user').then(function (User) {
                User.count({
                    role: ["lecturer", ["moderator"]],
                    field: field.id
                }).exec(function (error, numOfLecturers) {
                    if (error) {
                        req.flash('errorMessage', error.message);
                        return res.redirect('/fields');
                    }

                    var numberOfPages;
                    if (numOfLecturers % paginationConfig.numberOfUsersPerPage == 0) {
                        numberOfPages = Math.floor(numOfLecturers / paginationConfig.numberOfUsersPerPage);
                    } else {
                        numberOfPages = Math.floor(numOfLecturers / paginationConfig.numberOfUsersPerPage) + 1;
                    }

                    return res.render('./public/browse/lecturers_by_field', {
                        req: req,
                        message: req.flash('errorMessage'),
                        field: field,
                        numberOfPages: numberOfPages
                    });
                })
            });


        })
    })
};