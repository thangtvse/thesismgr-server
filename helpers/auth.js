

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