'use strict';
/**
 * Utility module that allows the following:
 *
 */

module.exports = ValidateData;

var amanda = require('amanda');
// Initialize a JSON Schema validator.
var jsonSchemaValidator = amanda('json');
var logger = require('./logUtil');

/**
 * Create User Authentication Service JSON req Schema
 */
var CREATE_USER_JSON_SCHEMA = {
    type: 'object',
    properties: {
        "login": {
            required: true,
            type: "string",
            minLength: 6,
            maxLength: 255
        },
        "firstName": {
            required: true,
            type: "string",
            minLength: 1,
            maxLength: 100
        },
        "lastName": {
            required: true,
            type: "string",
            minLength: 1,
            maxLength: 100
        },
        "role": {
            required: true,
            type: "string",
            enum: ["Customer", "Administrator", "Helpdesk"]
        },
        "country": {
            required: true,
            type: "string",
            minLength: 1,
            maxLength: 100
        },
        "state": {
            required: false,
            type: "string",
            minLength: 1,
            maxLength: 100
        },
        "city": {
            required: true,
            type: "string",
            minLength: 1,
            maxLength: 100
        },
        "postalCode": {
            required: true,
            type: "string",
            minLength: 1,
            maxLength: 10
        }

    },
    "additionalProperties": false
};

function ValidateData() {

};

ValidateData.isCreateUserRequestDataValid = function (reqData, fCallback) {
    return ValidateData.isValidRequestData(reqData, CREATE_USER_JSON_SCHEMA, fCallback);
};


ValidateData.isValidRequestData = function (reqData, reqSchema, fCallback) {
    jsonSchemaValidator.validate(reqData, reqSchema, function (errors) {
        if (errors) {
            if (!Array.isArray(errors)) {
                errors = new Array(errors);
            }
            for (var j = 0; j < errors.length; j++) {
                var error = JSON.stringify(errors[j]);
                var property = error.property;
                if (property !== undefined && property[0] === 'password') {
                    logger.msg('INFO', 'commonUtil', '', '', 'isValidRequestData', 'ERROR :\n' + error.message);
                    fCallback(false);
                } else {
                    logger.msg('INFO', 'commonUtil', '', '', 'isValidRequestData', 'ERROR :\n' + JSON.stringify(error));
                    fCallback(false);
                }
            }
        } else {
            logger.msg('INFO', 'commonUtil', '', '', 'isValidRequestData', 'Schema validation is successful');
            fCallback(true);
        }
    });
};
