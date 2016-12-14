var getModel = require('express-waterline').getModels;

module.exports = {
    identity: 'council',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true,
            unique: true
        },
        members: {
            collection: 'lecturer',
            via: 'councils'
        },

        chairman: {
            model: 'lecturer',
            required: true
        },

        secretary: {
            model: 'lecturer',
            required: true
        },

        theses: {
            collection: 'thesis',
            via: 'council'
        },

        session: {
            model: 'session',
            required: true
        }
    },

    getPopulatedCouncil: function (id, next) {
        getModel('council').then(function (Council) {
            Council.findOne({
                id: id
            })
                .populate('members')
                .populate('chairman')
                .populate('secretary')
                .exec(function (error, council) {
                    if (error) {
                        return next(error);
                    }

                    if (!council) {
                        return next(new Error("Council not found."));
                    }

                    var resCouncil = council.toObject();
                    resCouncil.members = [];

                    async.paralell([
                        function (callback) {

                            async.forEach(council.members, function (member, callback) {
                                getModel('lecturer').then(function (Lecturer) {
                                    Lecturer.findOne({
                                        id: member.id
                                    }).populate('user')
                                        .exec(function (error, result) {
                                            if (error) {
                                                return callback(error);
                                            }
                                            resCouncil.members.push(result);
                                            return callback();
                                        })
                                })

                            }, function (errors) {
                                if (errors && errors.length > 0) {
                                    return callback(errors[0]);
                                }
                            })
                        },

                        function (callback) {
                            getModel('lecturer').then(function (Lecturer) {
                                Lecturer.findOne({
                                    id: resCouncil.chairman.id
                                }).populate('user')
                                    .exec(function (error, result) {
                                        if (error) {
                                            return callback(error);
                                        }
                                        resCouncil.chairman = result
                                        return callback();
                                    })
                            })
                        },

                        function (callback) {
                            getModel('lecturer').then(function (Lecturer) {
                                Lecturer.findOne({
                                    id: resCouncil.secretary.id
                                }).populate('user')
                                    .exec(function (error, result) {
                                        if (error) {
                                            return callback(error);
                                        }
                                        resCouncil.secretary = result;
                                        return callback();
                                    })
                            })
                        }

                    ], function (errors) {
                        if (errors && errors.length > 0) {
                            return next(errors[0]);
                        }

                        return next(null, resCouncil);
                    });
                })
        })
    }
};