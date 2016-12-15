var getModel = require('express-waterline').getModels;
var slug = require('vietnamese-slug');
var paginationConfig = require('../config/pagination');
var async = require('async');

module.exports = {
    identity: 'topic',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        title: {
            type: 'string',
            required: true
        },

        slugName: {
            type: 'string',
            unique: true
        },

        lecturer: {
            model: 'lecturer'
        },

        fields: {
            collection: 'field',
            via: 'theses'
        },

        description: {
            type: 'text',
            required: true
        }
    },

    beforeCreate: function (values, next) {
        values.slugName = slug(values.title);
        next();
    },

    beforeUpdate: function (values, next) {
        values.slugName = slug(values.title);
        next();
    },

    getAllTopicOfALecturer: function (officerNumber, next) {
        getModel('user').then(function (User) {
            User.findOne({
                officerNumber: officerNumber
            })
                .populate('lecturers')
                .exec(function (error, user) {

                    if (error) {
                        return next(error);
                    }

                    if (user.role != 'lecturer' || user.role != 'moderator') {
                        return next(new Error("This user is not  a lecturer"));
                    }

                    if (!user.lecturers || user.lecturers.length == 0) {
                        return next(new Error("Internal error: Lecturer not found"));
                    }


                    getModel('topic').then(function (Topic) {
                        Topic.find({
                            lecturer: lecturers[0].id
                        })
                            .populate('lecturer')
                            .populate('fields')
                            .exec(function (error, topics) {
                                return next(error, topics)
                            })
                    })

                })
        })
    },

    searchTopicByName: function (page, searchText, next) {
        getModel('topic').then(function (Topic) {
            Topic.find({
                slugName: {
                    'contains': slug(searchText, ' ')
                }
            })
                .populate('fields')
                .paginate({
                    page: page,
                    limit: paginationConfig.numberOfUsersPerPage
                })
                .sort({
                    createdAt: 'desc'
                })
                .exec(function (error, topics) {
                    if (error) {
                        return next(error);
                    }

                    getModel('lecturer').then(function (Lecturer) {
                        var resTopics = [];

                        async.forEachSeries(topics, function (topic, callback) {

                            var resTopic = topic.toObject();

                            Lecturer.findOne({
                                id: topic.lecturer
                            })
                                .populate('user')
                                .exec(function (error, lecturer) {
                                    if (error) {
                                        return callback(error);
                                    }

                                    if (!lecturer) {
                                        return callback(new Error("Lecturer not found"));
                                    }

                                    resTopic.lecturer = lecturer.toObject();
                                    resTopics.push(resTopic);
                                    return callback();
                                })
                        }, function (errors) {
                            if (errors && errors.length > 0) {
                                return next(errors[0]);
                            }

                            return next(null, resTopics);
                        })
                    });
                })
        })
    },

    getNumberOfPagesOnSearchingTopicByName: function (text, next) {
        getModel('topic').then(function (Topic) {
            Topic.count({
                slugName: {
                    'contains': slug(text, ' ')
                }
            }).exec(function (error, numberOfTopics) {
                if (error) {
                    return next(error);
                }

                var numberOfPages;
                if (numberOfTopics % paginationConfig.numberOfUsersPerPage == 0) {
                    numberOfPages = Math.floor(numberOfTopics / paginationConfig.numberOfUsersPerPage);
                } else {
                    numberOfPages = Math.floor(numberOfTopics / paginationConfig.numberOfUsersPerPage) + 1;
                }

                return next(null, numberOfPages)
            })
        })
    }
};