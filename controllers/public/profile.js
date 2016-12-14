var getModel = require('express-waterline').getModels;
var createResponse = require('../../helpers/response').createRes;
var async = require('async');
var util = require('util');

exports.getProfileView = function (req, res) {

    if (req.user.role == 'lecturer' || req.user.role == 'moderator') {
        getModel('lecturer').then(function (Lecturer) {

            var fields;
            var lecturer;
            var topics;

            async.parallel([
                function (callback) {

                    Lecturer.getPopulatedLecturerList(1, {officerNumber: req.user.officerNumber}, function (error, lecturers) {
                        if (error) {
                            return callback(error)
                        }

                        if (!lecturers || lecturers.legnth == 0) {
                            return callback(new Error('Internal error: Lecturer not found'));
                        }

                        lecturer = lecturers[0];

                        getModel('topic').then(function (Topic) {
                            Topic.find({
                                lecturer: lecturer.lecturer.id
                            })
                                .sort({
                                    createdAt: 'desc'
                                })
                                .populate('fields')
                                .exec(function (error, results) {
                                    if (error) {
                                        return callback(error);
                                    }

                                    topics = results;

                                    return callback();
                                })
                        });
                    });
                }
            ], function (errors) {
                if (errors && errors.length > 0) {
                    if (error) {
                        req.flash('errorMessage', errors[0].message);
                        return res.redirect('/profile');
                    }
                }

                return res.render('./public/lecturer/profile', {
                    req: req,
                    profile: lecturer,
                    fields: fields,
                    topics: topics,
                    message: req.flash('errorMessage')
                });
            });
        })
    } else {
        // getModel('student').then(function (Student) {
        //     Student.getPopulatedStudentByOfficerNumber(req.user.officerNumber, function (error, student) {
        //         if (error) {
        //             req.flash('errorMessage', error.message);
        //             return res.redirect('/profile');
        //         }
        //
        //         if (!student) {
        //             req.flash('errorMessage', 'Internal error: Student not found');
        //             return res.redirect('/profile');
        //         }
        //
        //         return res.render('./public/student/profile', {
        //             req: req,
        //             profile: student,
        //             message: req.flash('errorMessage')
        //         });
        //     })
        // });
        return res.render('./public/partials/profile.change_password.ejs',{
            req:req,
            message: req.flash('errorMessage')
        });
    }
};

exports.getEditProfileView = function (req, res) {

    var data = {};

    async.parallel([
        function (callback) {
            getModel('unit').then(function (Unit) {
                Unit.find().exec(function (error, units) {
                    if (error) {
                        return callback(error);
                    }

                    data.units = units.filter(function (unit) {
                        return unit.left != 1
                    });

                    data.faculties = units.filter(function (unit) {
                        return unit.type == 'faculty'
                    });

                    return callback();
                })
            });
        },
        function (callback) {
            getModel('field').then(function (Field) {
                Field.find().exec(function (error, fields) {
                    if (error) {
                        return callback(error);
                    }

                    data.fields = fields.filter(function (field) {
                        return field.left != 1
                    });

                    return callback();
                })
            });
        },
        function (callback) {
            if (req.user.role == 'lecturer' || req.user.role == 'moderator') {
                getModel('lecturer').then(function (Lecturer) {
                    Lecturer.getPopulatedLecturerList(1, {officerNumber: req.user.officerNumber}, function (error, lecturers) {
                        if (error) {
                            return callback(error);
                        }

                        if (!lecturers || lecturers.legnth == 0) {
                            return callback(new Error("Internal error: Lecturer not found"))
                        }

                        data.profile = lecturers[0];

                        getModel('topic').then(function (Topic) {
                            Topic.find({
                                lecturer: data.profile.lecturer.id
                            })
                                .sort({
                                    createdAt: 'desc'
                                })
                                .populate('fields')
                                .exec(function (error, topics) {
                                    if (error) {
                                        return callback(error);
                                    }

                                    data.topics = topics;

                                    return callback();
                                })
                        });

                    })
                })
            } else {
                getModel('student').then(function (Student) {
                    Student.getPopulatedStudentByOfficerNumber(req.user.officerNumber, function (error, student) {
                        if (error) {
                            return callback(error);
                        }

                        if (!student) {
                            return callback(new Error("Student not found"))
                        }

                        data.profile = student;
                        return callback();
                    })
                });
            }
        }
    ], function (errors) {
        if (errors && errors.length > 0) {
            return res.status(400).send(createResponse(false, null, errors[0].message));
        }

        data.req = req;
        data.message = req.flash('errorMessage');

        if (req.user.role == 'lecturer') {
            res.render('./public/lecturer/profile.edit.ejs', data);
        } else if (req.user.role == 'student') {
            res.render('./public/student/profile.edit.ejs', data);
        }
    })


};

exports.getChangePasswordView = function (req, res) {
    return res.render('./public/partials/profile.change_password.ejs',
        {
            req: req,
            message: req.flash('errorMessage')
        }
    );
};

exports.changePasswordAPI = function (req, res) {
    req.checkBody("old_password", "Invalid old password.").notEmpty();
    req.checkBody("new_password", "Invalid new password.").notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('user').then(function (User) {
        User.changePassword(req.user.officerNumber, req.body.old_password, req.body.new_password, function (error, user) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, null, "Change password successfully!"));
        })
    })
};

exports.editProfileAPI = function (req, res) {

    if (req.body.fields == '') {
        delete req.body.fields;
    }

    req.checkBody('email', 'Invalid Email.').optional().isEmail();
    req.checkBody('unit_id', 'Invalid Unit ID.').optional().isUnitIDAvailable();
    req.checkBody('fields', 'Invalid fields.').optional().isFieldArrayStringAvailable();


    console.log(util.inspect(req.body));

    req.asyncValidationErrors()
        .then(function () {
            if (req.user.role == 'lecturer' || req.user.role == 'moderator') {
                getModel('lecturer').then(function (Lecturer) {

                    console.log("EDIT PROFILE=============");
                    console.log(util.inspect(req.body));

                    var opts = {
                        email: req.body.email,
                        unit: req.body.unit_id,
                        fullName: req.body.full_name,
                        rank: req.body.rank
                    };

                    if (req.body.fields) {
                        opts.fields = JSON.parse(req.body.fields);
                    }

                    Lecturer.updateProfile(req.user.officerNumber, opts, function (error) {
                        if (error) {
                            return res.status(400).send(createResponse(false, null, error.message));
                        }

                        return res.send(createResponse(true, null, null));
                    })
                })
            } else {

            }
        })
        .catch(function (errors) {
            return res.status(400).send(createResponse(false, null, errors[0].msg));
        })
};

exports.addTopicAPI = function (req, res) {
    if (req.body.fields == '') {
        delete req.body.fields;
    }

    req.checkBody('topic_title', 'Invalid Topic Name.').notEmpty();
    req.checkBody('topic_description', 'Invalid Topic Description.').notEmpty();
    req.checkBody('fields', 'Invalid fields.').optional().isFieldArrayStringAvailable();

    req.asyncValidationErrors()
        .then(function () {

            getModel('topic').then(function (Topic) {
                Topic.create({
                    title: req.body.topic_title,
                    description: req.body.topic_description,
                    fields: JSON.parse(req.body.fields),
                    lecturer: req.user.lecturer[0].id
                }).exec(function (error, topic) {
                    if (error) {
                        return res.status(400).send(createResponse(false, null, error.message));
                    }

                    return res.send(createResponse(true, topic, null));
                })
            })

        })
        .catch(function (errors) {
            return res.status(400).send(createResponse(false, null, errors[0].msg));
        });
};