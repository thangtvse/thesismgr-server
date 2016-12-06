var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;
var paginationConfig = require('../../config/pagination');

exports.getView = function (req, res) {
    
    getModel('unit').then(function (Unit) {
        Unit.findOne({
            slugName: req.params.slug
        }).exec(function (error, unit) {
            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/admin/users/students');
            }

            getModel('user').then(function (User) {
                User.count({
                    role: ["lecturer",["moderator"]],
                    unit: unit.id
                }).exec(function (error, numOfLecturers) {
                    if (error) {
                        req.flash('errorMessage', error.message);
                        return res.redirect('/admin/users/students');
                    }

                    var numberOfPages;
                    if (numOfLecturers % paginationConfig.numberOfUsersPerPage == 0) {
                        numberOfPages = Math.floor(numOfLecturers / paginationConfig.numberOfUsersPerPage);
                    } else {
                        numberOfPages = Math.floor(numOfLecturers / paginationConfig.numberOfUsersPerPage) + 1;
                    }

                    return res.render('./public/browse/lecturers_by_categories', {
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