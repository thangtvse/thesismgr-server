/**
 * Created by Tran Viet Thang on 10/22/2016.
 */

var express = require('express');
var router = express.Router();

var User = require('../models/User');
var createResponse = require('../helpers/response').createRes;
var validator = require('../helpers/validator');

/**
 * @api {get} /users/:id Request User information by users id
 * @apiName GetUser
 * @apiGroup User
 *
 *
 * @apiSuccess {String} _id Users id
 * @apiSuccess {String} username Created username.
 */
router.get('/:id', function (req, res) {
    var id = req.params.id;

    User.findById(id, function (err, user) {
        if (err) {
            return res.send(createResponse(false, {}, err.message));
        }

        return res.send(createResponse(true, {}, {
            _id: user._id,
            username: user.username
        }));
    });

});

/**
 * @api {post} /users/register Register an account
 * @apiName Register
 * @apiGroup User
 *
 * @apiParam {Boolean} username Unique username. Must be an email
 * @apiParam {String} password password
 *
 *
 * @apiSuccess {Boolean} success Success or not
 * @apiSuccess {Object} data Returned data
 * @apiSuccess {String} data._id Users id
 * @apiSuccess {String} data.username Created username.
 */
router.post('/register', function (req, res) {

    var username = req.body.username;
    var password = req.body.password;

    validator.validateRegistration(username, password, function (err) {
        if (err) {
            return res.send(createResponse(false, {}, err.message));
        }

        var newUser = new User({
            username: username,
            password: password
        });

        newUser.save(function (err, savedUser) {
            if (err) {
                return res.send(createResponse(false, {}, err.message));
            }

            return res.send(createResponse(true,
                {
                    _id: savedUser._id,
                    username: username
                },
                "Create account successfully!"));
        })
    });
});

module.exports = router;