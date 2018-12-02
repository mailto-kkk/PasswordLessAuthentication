'use strict';

module.exports = UserModel;

var logger = require('../lib/logUtil');
var uuid = require('uuid');
var async = require("async");
function UserModel() {
    return {

        "login": "",
        "firstName": "",
        "lastName": "",

    }
};


UserModel.checkTenantLoginExists = function (connection, newUser, validateFlg, callback) {
	if (validateFlg) {

		var chkTenantLoginSQL = "SELECT 1 FROM AUTH_USER_TEST WHERE LOGIN = LOWER(?) ";

		connection.query(chkTenantLoginSQL, [newUser.login], function (err, results) {
			if (err) {
                logger.msg('ERROR', 'v1', '', 'usermgnt', 'checkTenantLoginExists', 'error - ' + err.stack);
				callback(true);
			} else {
				if (results.length >0) {
                    logger.msg('INFO', 'v1', '', 'usermgnt', 'checkTenantLoginExists', 'LOGIN already exists for this TENANT_IID');
					callback(true);
				} else {
                    logger.msg('INFO', 'v1', '', 'usermgnt', 'checkTenantLoginExists', 'LOGIN does not exist for this TENANT_IID. Proceed with creation.');
					callback(false);
				}
			}
		});
	} else {
		callback(false);
	}
};



UserModel.createUser = function (connection, newUser, callback){
    newUser.referenceUUID = uuid.v4();
    var insertLoginSQL = "INSERT INTO AUTH_USER_TEST (LOGIN, FIRST_NAME, LAST_NAME,  REFERENCE_UUID,  CREATED_TIME_UTC,COUNTRY,STATE,CITY," +
        "POSTAL_CODE,STATUS,ROLE,LOGIN_SIGNATURE) VALUES " +
        "(LOWER(?), ?, ?,  ?,  UTC_TIMESTAMP(4),?,?,?,?,'ACTIVE',?,?)";
    connection.query(insertLoginSQL, [newUser.login, newUser.firstName, newUser.lastName, newUser.referenceUUID,
            newUser.country,newUser.state,newUser.city,newUser.postalCode,newUser.role,''], function (err, result) {
        if (err) {
            logger.msg('ERROR', 'v1', '', 'usermgnt', 'createUser', 'Error in insertLoginSQL - ' + err.stack);
            callback(true);
        }else{
            logger.msg('INFO', 'v1', '', 'usermgnt', 'createUser', '***** User created successfully');
            callback(false, newUser.referenceUUID);
        }
    });
};



UserModel.checkValidUser = function (connection, newUser, callback) {

    var checkValidTenantUserSQL = "SELECT USER.REFERENCE_UUID AS REFERENCE_UUID FROM AUTH_USER_TEST USER  where " +
        "  LOGIN = LOWER(?) AND LOGIN_SIGNATURE = ? ";
    connection.query(checkValidTenantUserSQL, [ newUser.login, newUser.loginSignature], function (err, rows) {
        if (err) {
            logger.msg('ERROR', 'v1', '', 'usermgnt', 'checkValidTenantUser', 'error - ' + err.stack);
            callback(true, false);
        } else {
            logger.msg('INFO', 'v1', '', 'usermgnt', 'checkValidTenantUser', '**** UserModel > checkValidTenantUser :: Result Length-' + rows.length);
            if (rows.length === 1) {
                var referenceUuid = rows[0].REFERENCE_UUID;
                callback(false, rows[0]);
            } else {
                logger.msg('INFO', 'v1', '', 'usermgnt', 'checkValidTenantUser', '**** UserModel > checkValidTenantUser :: Invalid Credentials');
                callback(true, true);
            }
        }
    });
};


UserModel.getUserDetailsByRef = function (connection, userObject, callback) {

    var getDetailsSQL = "SELECT USER.USER_IID AS  USER_IID,USER.LOGIN AS LOGIN,USER.FIRST_NAME AS FIRST_NAME,USER.LAST_NAME AS LAST_NAME," +
        " USER.COUNTRY AS COUNTRY,USER.STATE AS STATE,USER.CITY AS CITY,USER.POSTAL_CODE AS POSTAL_CODE,USER.STATUS AS STATUS,USER.ROLE AS ROLE "+
        " FROM AUTH_USER_TEST USER WHERE REFERENCE_UUID = ?";
    connection.query(getDetailsSQL, [userObject.referenceUUID], function (err, rows) {
        if (err) {
            logger.msg('ERROR', 'v1', '', 'usermgnt', 'getUserDetailsByRef', 'Error in getDetailsSQL - ' + err.stack);
            callback(true, null);
        } else {
            logger.msg('INFO', 'v1', '', 'usermgnt', 'getUserDetailsByRef', '**** UserModel > getUserDetailsByRef :: Result Length-' + rows.length);
            if (rows.length === 1) {
                logger.msg('INFO', 'v1', '', 'usermgnt', 'getUserDetailsByRef', 'LOGIN is: ' + rows[0].LOGIN);

                callback(false, rows[0]);
            } else {
                logger.msg('INFO', 'v1', '', 'usermgnt', 'getUserDetailsByRef', '**** UserModel > getUserDetailsByRef :: Invalid UserRef or Invalid tenantIID');
                callback(true, null);
            }
        }
    });
};


UserModel.updateUser = function (connection, userObject, callback){
    var updateQuery = "UPDATE AUTH_USER_TEST SET LOGIN_SIGNATURE=? WHERE USER_IID=?";
    connection.query(updateQuery, [userObject.loginSignature,userObject.userIID], function (err, result) {
        if(err){
            logger.msg('ERROR', 'v1', '', 'usermgnt', 'updateUser', 'Error during updateQuery - ' + err.stack);
            callback(true);
        }else{
            callback(false, userObject.referenceUUID);
        }
    });
};
