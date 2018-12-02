'use strict';


module.exports = CommonUtil;

var logger = require('./logUtil'),
    DBUtil = require('./dbUtil'),
    nconf = require('nconf'),
    cryptUtil = require('./cryptUtil'),
    HTTPStatus = require('http-status');

function CommonUtil() {
};

CommonUtil.sendResponseWoBody = function (res, httpCode) {
    res.status(httpCode);
    res.end();

};
CommonUtil.returnResponse = function (dbConn, errCode, succObj, errObj, property, res) {
    if (dbConn) {
        DBUtil.releaseConnection(dbConn);
    }
    CommonUtil.constructResponseHeader(res, function (res) {
        if (res) {
            res.status(errCode);
            if (succObj) {
                res.json(succObj);
            } else {
                if ((errCode === 409) && (errObj)) {            // Only for '409', we are constructing business exception block
                    var respJSON = {
                        "httpStatusCode": errCode,
                        "applicationErrorCode": errObj.errorCode,
                        "applicationErrorMessage": errObj.errorMessage,
                        "property": property
                    };
                    res.json(respJSON);
                } else {
                    if (errCode === 405) {
                        logger.msg('INFO', 'commonUtil', '', '', 'returnResponse', 'Setting allow header in response');
                        res.header('Allow', 'GET, POST');
                    }
                }
            }
            res.end();
        }
    });
};

CommonUtil.constructResponseHeader = function (res, fCallback) {
    res.contentType('application/json; charset=utf-8');
    res.header('Cache-Control', 'no-cache');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');

    //res.removeHeader("Set-Cookie");
    res.header('X-FRAME-OPTIONS', 'deny');
    res.header('Server', 'Node JS / 0.10.0');
    //res.header('WWW-Authenticate', 'Basic');
    res.header('X-Powered-By', 'Node JS / 8.4.0');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-WebKit-CSP', 'default-src self');
    res.header('X-Content-Type-Options', 'nosniff');
    fCallback(res);
};
