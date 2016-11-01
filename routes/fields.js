/*
 * Project: ThesisMgr-Server
 * File: routes\fields.js
 */

var express = require('express');
var router = express.Router();
var fieldsCtrl = require('../controllers/fields');
var hasAccess = require('../middlewares/roles').hasAccess;

/**
 * @api {get} /fields/search Search fields by name
 * @apiName SearchField
 * @apiGroup field
 * 
 * @apiParam token access token
 * @apiParam {String} text Search text
 * 
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
  "status": true,
  "data": [
    {
      "field": {
        "_id": "58144c52fc716002a09dbd4f",
        "name": "B",
        "parentId": "58144c49fc716002a09dbd4e",
        "__v": 0,
        "rgt": 3,
        "lft": 2
      },
      "ancestors": [
        {
          "_id": "58144c49fc716002a09dbd4e",
          "name": "A",
          "__v": 0,
          "rgt": 8,
          "lft": 1
        }
      ],
      "descendants": []
    },
    {
      "field": {
        "_id": "5814560c6013381ed8bf816f",
        "rgt": 7,
        "lft": 6,
        "name": "Cbe",
        "parentId": "58144c49fc716002a09dbd4e",
        "__v": 0
      },
      "ancestors": [
        {
          "_id": "58144c49fc716002a09dbd4e",
          "name": "A",
          "__v": 0,
          "rgt": 8,
          "lft": 1
        }
      ],
      "descendants": []
    }
  ],
  "message": null
}
 * 
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 OK
 *     {  
 *       "status": false,
 *       "data": null,
 *       "message": "Something wrong"
 *     }
 */
router.get('/search', fieldsCtrl.searchField);


/**
 * @api {get} /fields Get all fields
 * @apiName GetAllFields
 * @apiGroup field
 * 
 * @apiParam token access token
 * 
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
  "status": true,
  "data": [
    {
      "field": {
        "_id": "58144c52fc716002a09dbd4f",
        "name": "B",
        "parentId": "58144c49fc716002a09dbd4e",
        "__v": 0,
        "rgt": 3,
        "lft": 2
      },
      "ancestors": [
        {
          "_id": "58144c49fc716002a09dbd4e",
          "name": "A",
          "__v": 0,
          "rgt": 10,
          "lft": 1
        }
      ],
      "descendants": []
    },
    {
      "field": {
        "_id": "5814560c6013381ed8bf816f",
        "rgt": 7,
        "lft": 6,
        "name": "Cbe",
        "parentId": "58144c49fc716002a09dbd4e",
        "__v": 0
      },
      "ancestors": [
        {
          "_id": "58144c49fc716002a09dbd4e",
          "name": "A",
          "__v": 0,
          "rgt": 10,
          "lft": 1
        }
      ],
      "descendants": []
    },
    {
      "field": {
        "_id": "581465927558ee20bcbadbca",
        "rgt": 9,
        "lft": 8,
        "name": "Cbe",
        "parentId": "58144c49fc716002a09dbd4e",
        "__v": 0
      },
      "ancestors": [
        {
          "_id": "58144c49fc716002a09dbd4e",
          "name": "A",
          "__v": 0,
          "rgt": 10,
          "lft": 1
        }
      ],
      "descendants": []
    }
  ],
  "message": null
}
 * 
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 OK
 *     {  
 *       "status": false,
 *       "data": null,
 *       "message": "Something wrong"
 *     }
 */
router.get('/', fieldsCtrl.getAllFields);


/**
 * @api {get} /fields/58144c49fc716002a09dbd4e Get a fields by id
 * @apiName GetFieldByID
 * @apiGroup field
 * 
 * @apiParam token access token
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
  "status": true,
  "data": 
    {
      "field": {
        "_id": "58144c52fc716002a09dbd4f",
        "name": "B",
        "parentId": "58144c49fc716002a09dbd4e",
        "__v": 0,
        "rgt": 3,
        "lft": 2
      },
      "ancestors": [
        {
          "_id": "58144c49fc716002a09dbd4e",
          "name": "A",
          "__v": 0,
          "rgt": 8,
          "lft": 1
        }
      ],
      "descendants": []
    },
    {
      "field": {
        "_id": "5814560c6013381ed8bf816f",
        "rgt": 7,
        "lft": 6,
        "name": "Cbe",
        "parentId": "58144c49fc716002a09dbd4e",
        "__v": 0
      },
      "ancestors": [
        {
          "_id": "58144c49fc716002a09dbd4e",
          "name": "A",
          "__v": 0,
          "rgt": 8,
          "lft": 1
        }
      ],
      "descendants": []
    },
  "message": null
}
 * 
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 OK
 *     {  
 *       "status": false,
 *       "data": null,
 *       "message": "Something wrong"
 *     }
 */
router.get('/:id', fieldsCtrl.getFieldById);


/**
 * @api {post} /fields/ Post a new fields
 * @apiName Postfield
 * @apiGroup field
 * 
 * @apiParam token access token
 * @apiParam name field name
 * @apiParam parent_id ID of parent field
 * 
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
  "status": true,
  "data": 
    {
 
        "_id": "58144c52fc716002a09dbd4f",
        "name": "B",
        "parentId": "58144c49fc716002a09dbd4e",
        "__v": 0,
        "rgt": 3,
        "lft": 2
    },
  "message": null
}
 * 
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 OK
 *     {  
 *       "status": false,
 *       "data": null,
 *       "message": "Something wrong"
 *     }
 */
router.post('/', [
  hasAccess('admin'),
  fieldsCtrl.postField
]);



// router.delete('/:id',[
//   hasAccess('admin'),
//   fieldsCtrl.deleteField
// ]);


module.exports = router;