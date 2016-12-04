var LocalStrategy = require('passport-local').Strategy;
var getModels = require('express-waterline').getModels;

module.exports = function (passport) {




    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });


    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        console.log('deserializeUser...');
        getModels('user').then(function (User) {
            User.findOne({id: id})
                .populate('unit')
                .populate('faculty')
                .exec(function (err, user) {
                    console.log(user);
                    done(err, user);
                });
        });
    });


    // =========================================================================
    // ADMIN LOGIN =============================================================
    // =========================================================================

    passport.use('admin-login', new LocalStrategy({

            usernameField: 'officer_number',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, officerNumber, password, done) {

            console.log(officerNumber + " " + password);

            getModels('user').then(function (User) {
                User.adminLogin(officerNumber, password, function (err, result, user) {
                    if (err) {
                        return done(err, false, req.flash('loginMessage', 'Sorry. There are some errors.'));
                    }

                    if (result == false) {
                        return done(null, false, req.flash('loginMessage', 'Wrong officer number or password.'));
                    }

                    return done(null, user);
                });
            });
        }));

};