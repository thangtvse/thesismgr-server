/*
 * Project: ThesisMgr-Server
 * File: routes\users.js
 */
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var createResponse = require('../helpers/response').createRes;
var usersCtrl = require('../controllers/users');
var hasAccess = require('../middlewares/roles').hasAccess;

/**
 * @api {get} /users/:id Get user by users id
 * @apiName GetUser
 * @apiGroup User
 * 
 * @apiParam token access token
 */
router.get('/:id', usersCtrl.getUserByID);

/**
 * @api {get} /users/:id Get moderator by id
 * @apiName GetModerator
 * @apiDescription Must have a moderator access level.
 * @apiGroup User
 * 
 * @apiParam token access token
 */
router.get('/moderators/:id', [
    hasAccess(['moderator']),
    usersCtrl.getModeratorByID
]);

/**
 * @api {post} /users/login Login
 * @apiName Login
 * @apiGroup User
 * 
 * @apiParam username username
 * @apiParam password password
 */
router.post('/login', usersCtrl.login);

/**
 * @api {post} /users/create Create an user
 * @apiName CreateUser
 * @apiDescription Must have a moderator access level for creating student and lecturer users or admin access level for creating moderators.
 * Password is auto generated.
 * @apiGroup User
 * 
 * @apiParam token access token
 * @apiParam officer_number officer number
 * @apiParam username username
 * @apiParam role role (moderator, student, lecturer)
 * @apiParam office_id office ID
 * @apiParam full_name full name
 */
router.post('/create', [
    hasAccess('moderator'),
    usersCtrl.createUser
]);

module.exports = router;