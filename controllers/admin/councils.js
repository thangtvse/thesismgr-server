var getModel = require('express-waterline').getModels;
var paginationConfig = require('../../config/pagination');
var createResponse = require('../../helpers/response').createRes;
var async = require('async');

exports.getView = function (req, res) {

    var opts = {};

    if (req.user.role == 'moderator') {
        opts.faculty = req.user.faculty.id;
    }

    var data= {
        req: req,
        numberOfThesesPerPage: paginationConfig.numberOfUsersPerPage,
        message: req.flash('errorMessage')
    };

    async.parallel([
        function (callback) {
          getModel('unit').then(function (Unit) {
              Unit.getAllFaculties(function (error, faculties) {
                  if (error) {
                      return callback(error);
                  }

                  data.faculties = faculties;
                  return callback();
              })
          })
        },

        function (callback) {
            getModel('council').then(function (Council) {
                Council.count(opts).exec(function (error, numberOfCouncils) {
                    if (error) {
                        return callback(error);
                    }

                    var numberOfPages;
                    if (numberOfCouncils % paginationConfig.numberOfUsersPerPage == 0) {
                        numberOfPages = Math.floor(numberOfCouncils / paginationConfig.numberOfUsersPerPage);
                    } else {
                        numberOfPages = Math.floor(numberOfCouncils / paginationConfig.numberOfUsersPerPage) + 1;
                    }

                    data.numberOfPages = numberOfPages;

                    callback();
                })
            })
        },
        function (callback) {
            getModel('session').then(function (Session) {
                Session.getAllAvailableSessions(function (error, sessions) {
                    if (error) {
                        return callback(error);
                    }

                    data.sessions = sessions;
                    return callback();
                })
            })
        }
    ], function (errors) {

        if (errors && errors.length >0) {
            return res.redirect('/500');
        }

        res.render('./admin/councils/councils', data);
    })


};

exports.getCouncilsAPI = function (req, res) {

    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    var opts = {};

    if (req.user.role == 'moderator') {
        opts.faculty = req.user.faculty.id;
    }

    getModel('council').then(function (Council) {
        Council.getPopulatedCouncilList(req.query.page, opts, function (error, councils) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, councils, null));
        })
    })
};

exports.getAllCouncilsAPI = function (req, res) {

    req.checkQuery('session_id', 'Invalid session ID.').notEmpty()

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    var opts = {};

    if (req.user.role == 'moderator') {
        opts.faculty = req.user.faculty.id;
    }

    opts.session = req.query.session_id;

    getModel('council').then(function (Council) {
        Council.getPopulatedCouncilList(req.query.page, opts, function (error, councils) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, councils, null));
        })
    })
};

exports.createCouncilAPI = function (req, res) {

    if (req.body.fourth_member == "") {
        delete req.body.fourth_member;
    }

    if (req.body.fifth_member == "") {
        delete req.body.fifth_member;
    }


    req.checkBody('name', 'Invalid name.').notEmpty();
    req.checkBody('faculty_id', 'Invalid faculty ID').notEmpty().isFacultyIDAvailable();
    req.checkBody('session_id', 'Invalid session ID').notEmpty().isSessionIDAvailable();
    req.checkBody('chairman', 'Invalid chairman').notEmpty().isLecturerOfficerNumberAvailable();
    req.checkBody('secretary', 'Invalid secretary').notEmpty().isLecturerOfficerNumberAvailable();
    req.checkBody('reviewer', 'Invalid reviewer').notEmpty().isLecturerOfficerNumberAvailable();
    req.checkBody('fourth_member', 'Invalid fourth member').optional().isLecturerOfficerNumberAvailable();
    req.checkBody('fifth_member', 'Invalid fifth member').optional().isLecturerOfficerNumberAvailable();

    req.asyncValidationErrors()
        .then(function () {
            var memberOfficerNumbers = [];

            if (req.body.fourth_member) {
                memberIDs.push(req.body.fourth_member);
            }

            if (req.body.fifth_member) {
                memberIDs.push(req.body.fifth_member);
            }


            var chairman;
            var secretary;
            var reviewer;
            var members = [];

            getModel('user').then(function (User) {
                async.parallel([
                    function (callback) {
                        User.findOne({
                            officerNumber: req.body.chairman
                        })
                            .populate('lecturer')
                            .exec(function (error, user) {

                                if (error) {
                                    return callback(error);
                                }

                                chairman = user.lecturer[0].id;
                                members.push(chairman);

                                return callback();
                        })
                    },

                    function (callback) {
                        User.findOne({
                            officerNumber: req.body.secretary
                        })
                            .populate('lecturer')
                            .exec(function (error, user) {

                                if (error) {
                                    return callback(error);
                                }

                                secretary = user.lecturer[0].id;
                                members.push(secretary);
                                return callback();
                            })
                    },

                    function (callback) {
                        User.findOne({
                            officerNumber: req.body.reviewer
                        })
                            .populate('lecturer')
                            .exec(function (error, user) {

                                if (error) {
                                    return callback(error);
                                }

                                reviewer = user.lecturer[0].id;
                                members.push(reviewer);
                                return callback();
                            })
                    },

                    function (callback) {
                        async.forEach(memberOfficerNumbers, function (officerNumber, callback) {

                            User.findOne({
                                officerNumber: officerNumber
                            })
                                .populate('lecturer')
                                .exec(function (error, user) {

                                    if (error) {
                                        return callback(error);
                                    }

                                    members.push(user.lecturer[0].id);
                                    return callback();
                                })

                        }, function (errors) {
                            if (errors && errors.length >0) {
                                return callback(errors[0]);
                            }

                            return callback();
                        })
                    }
                ], function (errors) {

                    if (errors && errors.length >0) {
                        req.flash('errorMessage', errors[0].message);
                        return res.redirect('/admin/councils');
                    }


                    getModel('council').then(function (Council) {
                        Council.create({
                            name: req.body.name,
                            faculty: req.body.faculty_id,
                            chairman: chairman,
                            secretary: secretary,
                            reviewer: reviewer,
                            members: members,
                            session: req.body.session_id
                        }).exec(function (error, council) {
                            if (error) {
                                req.flash('errorMessage', error.message);
                            }

                            return res.redirect('/admin/councils');
                        })
                    })
                });


            });

        })
        .catch(function (errors) {
            console.log(errors);
            req.flash('errorMessage', errors[0].msg);
            return res.redirect('/admin/councils');
        });
};