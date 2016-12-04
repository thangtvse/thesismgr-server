var getModel = require('express-waterline').getModels;
var util = require('util');
var checkFacultyForProcess = require('../../helpers/auth').checkFacultyForProcess;

var isValidType = function (type) {
    return !(type != 'program' && type != 'course');
};

/**
 * Get a view for presenting programs or courses
 * @param type
 * @returns {Function}
 */
exports.getView = function (type) {

    if (!isValidType(type)) {
        return console.log('Internal error: Invalid type');
    }

    return function (req, res) {
        getModel(type).then(function (Category) {
            getModel('unit').then(function (Unit) {

                var process = function (opts, currentFaculty, req, res) {
                    Category.find(opts)
                        .populate('faculty')
                        .exec(function (error, categories) {
                            if (error) {
                                console.log(error);
                                req.flash('errorMessage', error.message);
                                return res.redirect('/admin/categories/' + type + 's');
                            }

                            Unit.find({
                                type: 'faculty'
                            }).exec(function (error, faculties) {

                                if (error) {
                                    console.log(error);
                                    req.flash('errorMessage', error.message);
                                    return res.redirect('/admin/categories/' + type + 's');
                                }

                                var kCategories = type + "s";

                                var data = {};
                                data[kCategories] = categories;
                                data.message = req.flash('errorMessage');
                                data.faculties = faculties;
                                data.currentFaculty = currentFaculty;
                                data.req = req;

                                return res.render('./admin/categories/' + type + 's', data)
                            });
                        })
                };


                if (req.user.role == 'admin') {
                    // Return all faculties
                    process({}, null, req, res);
                } else {

                    // Return only one faculty which this moderator is managing
                    process({faculty: req.user.faculty.name}, req.user.faculty, req, res);

                }
            });
        })
    }
};


/**
 * Add a new category to the database
 */
exports.post = function (type) {
    return function (req, res) {

        req.checkBody('name', 'Invalid name').notEmpty();
        req.checkBody('faculty_id', 'Invalid faculty ID').notEmpty().isFacultyIDAvailable();

        req.asyncValidationErrors()
            .then(function () {
                getModel(type).then(function (Category) {

                    checkFacultyForProcess(req, res, req.body.faculty_id, function () {
                        Category.createOne(req.body.name, req.body.faculty_id, function (error) {
                            if (error) {
                                console.log(error);
                                req.flash('errorMessage', error.message);
                            }

                            return res.redirect('/admin/categories/' + type + 's');
                        })
                    });
                })
            })
            .catch(function (errors) {
                console.log(util.inspect(errors));
                req.flash('errorMessage', errors[0].msg);
                return res.redirect('/admin/categories/' + type + 's');
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
            req.flash('errorMessage', 'Null ID');
            return res.redirect('/admin/categories/' + type + 's');
        }

        getModel(type).then(function (Category) {

            checkFacultyForProcess(req, res, req.body.faculty_id, function () {
                Category.destroy(id, function (error) {
                    if (error) {
                        console.log(error);
                        req.flash('errorMessage', error.message);
                    }

                    return res.redirect('/admin/categories/' + type + 's');
                })
            });
        })

    };
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

            Category.findOne(req.body.id).exec(function (error, category) {
                if (error) {
                    req.flash('errorMessage', error.message);
                    return res.redirect('/admin/categories/' + type + 's');
                }

                if (category == null) {
                    return res.render('./partials/400');
                }

                checkFacultyForProcess(req, res, category.faculty, function () {
                    category.name = req.body.name;
                    category.save(function (error) {
                        if (error) {
                            req.flash('errorMessage', error.message);
                        }

                        return res.redirect('/admin/categories/' + type + 's');
                    })
                })
            });
        })
    }
};

