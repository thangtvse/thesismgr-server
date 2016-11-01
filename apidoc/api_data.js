define({ "api": [
  {
    "type": "get",
    "url": "/offices",
    "title": "Get all offices",
    "name": "GetAllOffices",
    "group": "Office",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": true,\n  \"data\": [\n    {\n      \"field\": {\n        \"_id\": \"58144c52fc716002a09dbd4f\",\n        \"name\": \"B\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0,\n        \"rgt\": 3,\n        \"lft\": 2\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 10,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    },\n    {\n      \"field\": {\n        \"_id\": \"5814560c6013381ed8bf816f\",\n        \"rgt\": 7,\n        \"lft\": 6,\n        \"name\": \"Cbe\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 10,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    },\n    {\n      \"field\": {\n        \"_id\": \"581465927558ee20bcbadbca\",\n        \"rgt\": 9,\n        \"lft\": 8,\n        \"name\": \"Cbe\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 10,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    }\n  ],\n  \"message\": null\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 OK\n{  \n  \"status\": false,\n  \"data\": null,\n  \"message\": \"Something wrong\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/offices.js",
    "groupTitle": "Office",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/offices"
      }
    ]
  },
  {
    "type": "get",
    "url": "/offices/58144c49fc716002a09dbd4e",
    "title": "Get an office by id",
    "name": "GetOfficeByID",
    "group": "Office",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": true,\n  \"data\": \n    {\n      \"field\": {\n        \"_id\": \"58144c52fc716002a09dbd4f\",\n        \"name\": \"B\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0,\n        \"rgt\": 3,\n        \"lft\": 2\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 8,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    },\n    {\n      \"field\": {\n        \"_id\": \"5814560c6013381ed8bf816f\",\n        \"rgt\": 7,\n        \"lft\": 6,\n        \"name\": \"Cbe\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 8,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    },\n  \"message\": null\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 OK\n{  \n  \"status\": false,\n  \"data\": null,\n  \"message\": \"Something wrong\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/offices.js",
    "groupTitle": "Office",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/offices/58144c49fc716002a09dbd4e"
      }
    ]
  },
  {
    "type": "post",
    "url": "/offices/",
    "title": "Post a new office",
    "name": "PostOffices",
    "group": "Office",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "name",
            "description": "<p>Office name</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "parent_id",
            "description": "<p>ID of parent office</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": true,\n  \"data\": \n    {\n \n        \"_id\": \"58144c52fc716002a09dbd4f\",\n        \"name\": \"B\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0,\n        \"rgt\": 3,\n        \"lft\": 2\n    },\n  \"message\": null\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 OK\n{  \n  \"status\": false,\n  \"data\": null,\n  \"message\": \"Something wrong\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/offices.js",
    "groupTitle": "Office",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/offices/"
      }
    ]
  },
  {
    "type": "get",
    "url": "/offices/search",
    "title": "Search office by name",
    "name": "SearchOffice",
    "group": "Office",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Search text</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": true,\n  \"data\": [\n    {\n      \"field\": {\n        \"_id\": \"58144c52fc716002a09dbd4f\",\n        \"name\": \"B\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0,\n        \"rgt\": 3,\n        \"lft\": 2\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 8,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    },\n    {\n      \"field\": {\n        \"_id\": \"5814560c6013381ed8bf816f\",\n        \"rgt\": 7,\n        \"lft\": 6,\n        \"name\": \"Cbe\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 8,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    }\n  ],\n  \"message\": null\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 OK\n{  \n  \"status\": false,\n  \"data\": null,\n  \"message\": \"Something wrong\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/offices.js",
    "groupTitle": "Office",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/offices/search"
      }
    ]
  },
  {
    "type": "post",
    "url": "/users/create",
    "title": "Create an user",
    "name": "CreateUser",
    "description": "<p>Must have a moderator access level for creating student and lecturer users or admin access level for creating moderators. Password is auto generated.</p>",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "officer_number",
            "description": "<p>officer number</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "username",
            "description": "<p>username</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "role",
            "description": "<p>role (moderator, student, lecturer)</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "office_id",
            "description": "<p>office ID</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "full_name",
            "description": "<p>full name</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/users.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/users/create"
      }
    ]
  },
  {
    "type": "get",
    "url": "/users/:id",
    "title": "Get moderator by id",
    "name": "GetModerator",
    "description": "<p>Must have a moderator access level.</p>",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/users.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/users/:id"
      }
    ]
  },
  {
    "type": "get",
    "url": "/users/:id",
    "title": "Get user by users id",
    "name": "GetUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/users.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/users/:id"
      }
    ]
  },
  {
    "type": "post",
    "url": "/users/login",
    "title": "Login",
    "name": "Login",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "username",
            "description": "<p>username</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "password",
            "description": "<p>password</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/users.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/users/login"
      }
    ]
  },
  {
    "type": "get",
    "url": "/fields",
    "title": "Get all fields",
    "name": "GetAllFields",
    "group": "field",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": true,\n  \"data\": [\n    {\n      \"field\": {\n        \"_id\": \"58144c52fc716002a09dbd4f\",\n        \"name\": \"B\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0,\n        \"rgt\": 3,\n        \"lft\": 2\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 10,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    },\n    {\n      \"field\": {\n        \"_id\": \"5814560c6013381ed8bf816f\",\n        \"rgt\": 7,\n        \"lft\": 6,\n        \"name\": \"Cbe\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 10,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    },\n    {\n      \"field\": {\n        \"_id\": \"581465927558ee20bcbadbca\",\n        \"rgt\": 9,\n        \"lft\": 8,\n        \"name\": \"Cbe\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 10,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    }\n  ],\n  \"message\": null\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 OK\n{  \n  \"status\": false,\n  \"data\": null,\n  \"message\": \"Something wrong\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/fields.js",
    "groupTitle": "field",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/fields"
      }
    ]
  },
  {
    "type": "get",
    "url": "/fields/58144c49fc716002a09dbd4e",
    "title": "Get a fields by id",
    "name": "GetFieldByID",
    "group": "field",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": true,\n  \"data\": \n    {\n      \"field\": {\n        \"_id\": \"58144c52fc716002a09dbd4f\",\n        \"name\": \"B\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0,\n        \"rgt\": 3,\n        \"lft\": 2\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 8,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    },\n    {\n      \"field\": {\n        \"_id\": \"5814560c6013381ed8bf816f\",\n        \"rgt\": 7,\n        \"lft\": 6,\n        \"name\": \"Cbe\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 8,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    },\n  \"message\": null\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 OK\n{  \n  \"status\": false,\n  \"data\": null,\n  \"message\": \"Something wrong\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/fields.js",
    "groupTitle": "field",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/fields/58144c49fc716002a09dbd4e"
      }
    ]
  },
  {
    "type": "post",
    "url": "/fields/",
    "title": "Post a new fields",
    "name": "Postfield",
    "group": "field",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "name",
            "description": "<p>field name</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "parent_id",
            "description": "<p>ID of parent field</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": true,\n  \"data\": \n    {\n \n        \"_id\": \"58144c52fc716002a09dbd4f\",\n        \"name\": \"B\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0,\n        \"rgt\": 3,\n        \"lft\": 2\n    },\n  \"message\": null\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 OK\n{  \n  \"status\": false,\n  \"data\": null,\n  \"message\": \"Something wrong\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/fields.js",
    "groupTitle": "field",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/fields/"
      }
    ]
  },
  {
    "type": "get",
    "url": "/fields/search",
    "title": "Search fields by name",
    "name": "SearchField",
    "group": "field",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "token",
            "description": "<p>access token</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "text",
            "description": "<p>Search text</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"status\": true,\n  \"data\": [\n    {\n      \"field\": {\n        \"_id\": \"58144c52fc716002a09dbd4f\",\n        \"name\": \"B\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0,\n        \"rgt\": 3,\n        \"lft\": 2\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 8,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    },\n    {\n      \"field\": {\n        \"_id\": \"5814560c6013381ed8bf816f\",\n        \"rgt\": 7,\n        \"lft\": 6,\n        \"name\": \"Cbe\",\n        \"parentId\": \"58144c49fc716002a09dbd4e\",\n        \"__v\": 0\n      },\n      \"ancestors\": [\n        {\n          \"_id\": \"58144c49fc716002a09dbd4e\",\n          \"name\": \"A\",\n          \"__v\": 0,\n          \"rgt\": 8,\n          \"lft\": 1\n        }\n      ],\n      \"descendants\": []\n    }\n  ],\n  \"message\": null\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 500 OK\n{  \n  \"status\": false,\n  \"data\": null,\n  \"message\": \"Something wrong\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/fields.js",
    "groupTitle": "field",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/fields/search"
      }
    ]
  }
] });
