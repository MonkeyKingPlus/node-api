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

#### Define your models if have
1.You have to define your models under path : **/service/swagger/models/**

2.Your models should be defined as json, ex. ***account.json***. Content refers to [**OpenAPI Specification**](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)
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
3.Add your model to **separateModels** in ***index.js***, ex.
```javascript
    var separateModels = [
        ... // other models
        require('./account.json')
    ];
```

####How to use it with express
```javascript
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