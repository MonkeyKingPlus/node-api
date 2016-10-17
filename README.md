# node-api
Building a RESTful API Using Node and Express 4

## Requirement
- Node and npm

## Installation

- Clone the repo: `git clone git@github.com:MonkeyKingPlus/node-api.git`
- Navigate to sourcecode path: `cd node-api`
- Install dependencies: `npm install`
- Start the server: `gulp s` or `node service\app.js`

## Testing the API

###Test your API using [Postman](https://chrome.google.com/webstore/detail/postman-rest-client-packa/fhbjgbiflinjbdggehcddcbncdddomop)

    Service will running at port 3000 as default
    
    Please visit http://localhost:3000/v1 on browser or postman
    
###Test your API using [Swagger](http://swagger.io/)
####Config your swagger
- app - express instanse
- options

    Key | Description
    --- | -----------
    port | port of your service, **3000** as default
    basePath | the base path of your service, **'/'** as default
    apis | files that contain the jsdoc information for swagger,**[]** as default

####How to document the API

The API can now be documented in JSDoc-style with swagger spec in [YAML](http://swagger.io/swagger-editor/).
```javascript
/**
 * @swagger
 * tags:
 *   - name: Login
 *     description: login services
 */
 
/**
 * @swagger
 * /login:
 *   post:
 *     description: Login to the application
 *     tags: [Login]
 *     parameters:
 *       - name: body
 *         description: User login model
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           $ref: '#/definitions/User'
 *     responses:
 *       default:
 *         description: error model
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Error'
 *       200:
 *         description: user info
 *         schema:
 *           type: object
 *           $ref: '#/definitions/User'
 */
loginRouter.post("/", function (req, res, next) {
    res.send("login");
});
```

####Re-using Model Definitions
1.You have to define your models under path : **/service/swagger/models/**

2.Your models should be defined as json, ex. ***account.json***.
```javascript
{
    "User": {
        "type": "object",
        "properties": {
            "LoginName": {
                "type": "string",
                "description": "user login name"
            },
            "Password": {
                "type": "string",
                "description": "password"
            }
        }
    }
}
```
3.Add models to **separateModels** in ***index.js***, ex.
```javascript
    var separateModels = [
        ... // other models
        require('./account.json')
    ];
```

For more details, please refer to [**OpenAPI Specification**](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)

####How to use it with express
```javascript
var path = require('path')

var express = require('express');

var config = {
    port: process.env.NODE_ENV, // your service running port
    root: path.normalize(__dirname + '/..') // your project root path
};
var app = express();
if (global.ENV == "development") {
    require("./swagger")(app,
        {
            port: config.port,
            basePath: "/v1",
            apis: glob.sync(config.root + '/service/controllers/**/*.js')
        });
}
```

