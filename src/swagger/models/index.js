var requireDir = require('require-dir');
var models = {};

var separateModels = requireDir(__dirname);

function transferModels() {
    for (var key in separateModels) {
        for (var key2 in separateModels[key]) {
            models[key2] = separateModels[key][key2];
        }
    }
}
transferModels();

module.exports = models;