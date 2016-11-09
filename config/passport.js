var LocalStrategy = require('passport-local').Strategy;
var getModels = require('express-waterline').getModels;

module.exports = function (passport) {



    getModels('user').then(function (User) {
        // =========================================================================
        // passport session setup ==================================================
        // =========================================================================
        // required for persistent login sessions
        // passport needs ability to serialize and unserialize users out of session

        // used to serialize the user for the session
        passport.serializeUser(function(user, done){
            done(null, user.id);
        });


        // used to deserialize the user
        passport.deserializeUser(function (id, done) {
            console.log('deserializeUser...');
            User.findOne({id: id}, function(err, user) {
                console.log(user);
                done(err, user);
            });
        });


        // =========================================================================
        // ADMIN LOGIN =============================================================
        // =========================================================================

        passport.use('admin-login', new LocalStrategy({

                usernameField : 'email',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, email, password, done) {

                User.adminLogin(email, password, function (err, result, user) {
                    if (err) {
                        return done(err, false, req.flash('loginMessage', 'Sorry. There are some errors.'));
                    }

                    if (result == false) {
                        return done(null, false, req.flash('loginMessage', 'Wrong username or password.'));
                    }

                    return done(null, user);
                });

            }));
    });
};