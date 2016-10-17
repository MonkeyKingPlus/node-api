module.exports = {
    "Error": {
        "type": "object",
        "properties": {
            "Code": {
                "type": "integer",
                "format": "int32"
            },
            "Message": {
                "type": "string"
            },
            "Data": {
                "type": "object"
            }
        }
    }
};