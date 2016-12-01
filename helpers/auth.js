var getModel = require('express-waterline').getModels;
var treeHelper = require('../helpers/tree');

exports.unless = function (paths, middleware) {
    return function (req, res, next) {

        console.log(req.path);

        var shouldRunMiddleware = true;

        paths.forEach(function (path) {
            if (req.path === path) {
                shouldRunMiddleware = false;
            }
        });

        if (shouldRunMiddleware) {
            return middleware(req, res, next);
        } else {
            return next();
        }


    };
};

/**
 * The process take an action based on a specific faculty.
 * We need to check if current user has right permission to do this process or not. If yes, let's process.
 * @param req
 * @param res
 * @param processFacultyID
 * @param process
 */
exports.checkFacultyForProcess = function (req, res, processFacultyID, process) {
    if (req.user.role == 'admin') {
        process(req, res);
    } else {
        // Return only one faculty which this moderator is managing

        if (req.user.faculty.id != processFacultyID) {
            return res.render('./partials/400');
        } else {
            process(req, res);
        }

    }
};

/**
 * The process take an action based on a specific unit.
 * We need to check if current user has right permission to do this process or not. If yes, let's process.
 * @param req
 * @param res
 * @param processUnitID
 * @param process
 */
exports.checkUnitForProcess = function (req, res, processUnitID, process) {
    if (req.user.role == 'admin') {
        return process(req, res);
    } else {
        // Return only one faculty which this moderator is managing
        if (req.user.faculty.id != processUnitID) {
            getModel('unit').then(function (Unit) {
                Unit.findOne({id: processUnitID}).exec(function (error, unit) {
                    treeHelper.findAncestorsAndDescendantsForUnit(unit, function (error, ancestors, descendants) {
                        if (error) {
                            console.log(error);
                            return res.render('./partials/500');
                        }

                        if (ancestors.indexOf(unit) == -1) {
                            console.log("Returning 400...");
                            return res.render('./partials/400');
                        } else {
                            return process(req, res);
                        }
                    })
                })
            });
        } else {
            return process(req, res);
        }
    }
};