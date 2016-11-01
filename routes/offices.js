/*
 * Project: ThesisMgr-Server
 * File: routes\offices.js
 */

var express = require('express');
var router = express.Router();
var officesCtrl = require('../controllers/offices');

/**
 * @api {get} /offices/search Search office by name
 * @apiName SearchOffice
 * @apiGroup Office
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
router.get('/search', officesCtrl.searchOffice);


/**
 * @api {get} /offices Get all offices
 * @apiName GetAllOffices
 * @apiGroup Office
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
router.get('/', officesCtrl.getAllOffices);


/**
 * @api {get} /offices/58144c49fc716002a09dbd4e Get an office by id
 * @apiName GetOfficeByID
 * @apiGroup Office
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
router.get('/:id', officesCtrl.getOfficeById);


/**
 * @api {post} /offices/ Post a new office
 * @apiName PostOffices
 * @apiGroup Office
 * 
 * @apiParam token access token 
 * @apiParam name Office name
 * @apiParam parent_id ID of parent office
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
router.post('/', officesCtrl.postOffice);


module.exports = router;