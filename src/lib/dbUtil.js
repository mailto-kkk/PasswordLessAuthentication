'use strict';

var mysql = require('mysql');
var logger = require('./logUtil');
var util = require('util');

var dbUtil = function () {
    var pool = null;
    return {
        config: function (conf) {
            logger.msg('INFO', 'v1', '', 'dbUtil', 'config', 'DBUtil::Config::MYSQL Pool configuration');
            pool = mysql.createPool(conf);
        },
        getConnection: function (callback) {
            logger.msg('INFO', 'v1', '', 'dbUtil', 'config', 'DBUtil::Config::getting DB Connection');
            //logger.trace('***** using pool: ' + util.inspect(pool));
            if (pool) {
                pool.getConnection(
                    function (err, dbConn) {
                        callback(err, dbConn);
                    }
                );
            } else {
                logger.msg('ERROR', 'v1', '', 'dbUtil', 'getConnection', 'DBUtil::getConnection::DB Pool not found.  Make sure dbUtil is configured properly.');
                var err = new Error('alert.error.internalError');
                if (callback) {
                    callback(err);
                } else {
                    throw err;
                }
            }
        },
        releaseConnection: function (connection) {
            logger.msg('INFO', 'v1', '', 'dbUtil', 'releaseConnection', 'DBUtil::releaseConnection ');
            if (connection) {
                connection.release();
            }
        }
    };
};

module.exports = dbUtil();
