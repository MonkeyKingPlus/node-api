var glob = require('glob-all');
var models = {};

var separateModels = [
    require('./account.json'),
    require('./error.json')
];

function transferModels() {
    for (var i = 0; i < separateModels.length; i++) {
        for (var key in separateModels[i]) {
            models[key] = separateModels[i][key];
        }
    }
}
transferModels();

module.exports = models;