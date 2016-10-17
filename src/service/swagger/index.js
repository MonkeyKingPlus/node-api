var path = require('path');

var express = require('express');
var swaggerJSDoc = require('swagger-jsdoc');

module.exports = function (app, options) {
    app.use(express.static(__dirname));

    var swaggerDefinition = {
        info: {
            title: 'MonkeyPlus Apis',
            version: '1.0.0',
            description: 'support monkey plus projects'
        },
        host: "localhost:" + options.port || "3000",
        basePath: options.basePath || "/",
        schemes: [
            "http",
            "https"
        ],
        produces: [//Response content types
            "application/json"
        ],
        consumes: [ //Parameter content types
            "application/json"
        ],
        definitions: require(path.normalize(__dirname + "/models/index.js"))
    };

    // Options for the swagger docs
    var jsDocOptions = {
        // Import swaggerDefinitions
        swaggerDefinition: swaggerDefinition,
        // Path to the API docs
        apis: options.apis || []
    };
    app.get('/api-docs.json', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerJSDoc(jsDocOptions));
    });
};