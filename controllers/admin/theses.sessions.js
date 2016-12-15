var getModel = require('express-waterline').getModels;
var paginationConfig = require('../../config/pagination');
var _ = require('underscore');
var createResponse = require('../../helpers/response').createRes;
var authHelper = require('../../helpers/auth');
var nodemailer = require('nodemailer');
var mailTransportConfig = require('../../config/mail').transportConfig;
var util = require('util');

/**
 * Lấy về view quản lí các kì đăng kí/ bảo vệ
 * @param req
 * @param res
 */
exports.getView = function (req, res) {

    var findOpts = {};
    if (req.user.role != 'admin') {
        findOpts = {
            faculty: req.user.faculty.id
        }
    }

    getModel('session').then(function (Session) {
        Session.count(findOpts).exec(function (error, numberOfSessions) {
            if (error) {
                req.flash('errorMessage', error.message);
                return res.redirect('/admin/theses/sessions');
            }

            getModel('unit').then(function (Unit) {
                Unit.find({
                    type: 'faculty'
                }).exec(function (error, units) {
                    if (error) {
                        req.flash('errorMessage', error.message);
                        return res.redirect('/admin/theses/sessions');
                    }

                    var filteredUnits = units.filter(function (unit) {
                        if (unit.left == 1) {
                            return false
                        } else {
                            return true
                        }
                    });

                    var numberOfPages;
                    if (numberOfSessions % paginationConfig.numberOfUsersPerPage == 0) {
                        numberOfPages = Math.floor(numberOfSessions / paginationConfig.numberOfUsersPerPage);
                    } else {
                        numberOfPages = Math.floor(numberOfSessions / paginationConfig.numberOfUsersPerPage) + 1;
                    }

                    res.render('./admin/theses/sessions', {
                        req: req,
                        faculties: _.map(filteredUnits, function (unit) {
                            return unit.toObject();
                        }),
                        numberOfPages: numberOfPages,
                        numberOfThesesPerPage: paginationConfig.numberOfUsersPerPage,
                        message: req.flash('errorMessage')
                    })
                })
            });
        })
    })
};

/**
 * Get all lecturers with pagination
 */
exports.getAllSessionsAPI = function (req, res) {

    req.checkQuery('page', 'Invalid page number.').notEmpty().isInt();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    var findOpts = {};
    if (req.user.role != 'admin') {
        findOpts = {
            faculty: req.user.faculty.id
        }
    }

    getModel('session').then(function (Session) {
        Session.find(findOpts)
            .populate('faculty')
            .sort({
                createdAt: 'desc'
            })
            .paginate({
                page: req.query.page,
                limit: paginationConfig.numberOfUsersPerPage
            }).exec(function (error, sessions) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            return res.send(createResponse(true, sessions, null));
        })
    })
};

/**
 * Create a new session
 * @param req
 * @param res
 */
exports.createSession = function (req, res) {

    req.checkBody('name', 'Invalid session name').notEmpty();
    req.checkBody('from', 'Invalid start date').notEmpty().isDate();
    req.checkBody('to', 'Invalid end date').notEmpty().isDate();
    req.sanitizeBody('from').toDate();
    req.sanitizeBody('to').toDate();
    req.checkBody('to', 'Invalid end date').gte(req.body.from);
    req.checkBody('faculty_id', 'Invalid faculty ID').notEmpty().isFacultyIDAvailable();

    req.asyncValidationErrors()
        .then(function () {
            authHelper.checkFacultyForProcess(req, res, req.body.faculty_id, function () {
                getModel('session').then(function (Session) {
                    Session.create({
                        name: req.body.name,
                        from: req.body.from,
                        to: req.body.to,
                        faculty: req.body.faculty_id
                    }).exec(function (error, session) {
                        if (error) {
                            req.flash('errorMessage', error.message);
                            return res.redirect('/admin/theses/sessions');
                        }

                        if (!session) {
                            req.flash('errorMessage', "Create session unsuccessfully.");
                            return res.redirect('/admin/theses/sessions');
                        }

                        return res.redirect('/admin/theses/sessions');
                    })
                })
            })
        })
        .catch(function (errors) {
            req.flash('errorMessage', errors[0].msg);
            return res.redirect('/admin/theses/sessions');
        });


};

/**
 * Notify about a session
 * @param req
 * @param res
 */
exports.notifyAPI = function (req, res) {

    req.checkBody("session_id", "Invalid session ID").notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(createResponse(false, null, errors[0].msg));
    }

    getModel('session').then(function (Session) {
        Session.findOne({
            id: req.body.session_id
        }).exec(function (error, session) {
            if (error) {
                return res.status(400).send(createResponse(false, null, error.message));
            }

            if (!session) {
                return res.status(400).send(createResponse(false, null, "Session not found."));
            }

            if (req.user.role != 'admin' && req.user.faculty.id != session.faculty) {
                return res.status(400).send(createResponse(false, null, "You have no permission for send notifications about this session."));
            }

            getModel('user').then(function (User) {
                User.find({
                    role: 'student',
                    faculty: session.faculty
                })
                    .populate("student")
                    .exec(function (error, users) {
                        if (error) {
                            return res.status(400).send(createResponse(false, null, error.message));
                        }

                        if (!users) {
                            return res.status(500).send(createResponse(false, null, "Internal error."));
                        }

                        res.send(createResponse(true, null, "Sent."));

                        _.forEach(users, function (user) {
                            if (user.student[0] && user.student[0].thesisRegistrable == true) {
                                //send mail
                                var mailTransporter = nodemailer.createTransport(mailTransportConfig);


                                // setup e-mail data with unicode symbols
                                var mailOptions = {
                                    from: '"ThesisMgr System 👥" <' + mailTransportConfig.auth.user + '>', // sender address
                                    to: user.email, // list of receivers
                                    subject: 'Invitation Mail', // Subject line
                                    text: "Session: " + session.name + " has been open!"// plaintext body
                                    //  html: '<b>Hello world 🐴</b>' // html body
                                };
                                
                                // send mail with defined transport object
                                mailTransporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        return console.log(util.inspect(error, false, 2, true));
                                    }

                                    console.log(util.inspect(info, false, 2, true));
                                });
                            }
                        })
                    })
            })
        })
    })
};