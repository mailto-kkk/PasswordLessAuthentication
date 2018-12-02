'use strict';

var DBUtil = require('../lib/dbUtil'),
    CommonUtil = require('../lib/commonUtil'),
    logger = require('../lib/logUtil'),
 smtpClient = require('../lib/smtpClient'),
    UserModel = require('../models/usermgnt'),
    validateData = require('../lib/validateData'),
    HTTPStatus = require('http-status'),
    async = require("async"),
    requestController = require('../lib/requestController'),
    nconf=require('nconf'),
    urlObj = require('url');
var uuid = require('uuid');

module.exports = function (server) {

   server.all('*', requestController);



    server.post('/User', function (req, res) {
        logger.msg('INFO', 'v1', '', '', 'POST User', 'Create user');
        nconf.file({file: 'config/settingsConfig.json'});
        var errorConfig = nconf.get('errorConfig');
        var emailConfig = nconf.get('emailConfig');
        var baseURL=nconf.get('baseURL');
        //var url_parts = urlObj.parse(req.url, true);
        DBUtil.getConnection(function (err, dbConn) {
            if (err) {
                logger.msg('ERROR', 'v1', '', '', 'POST User', 'error while getting the DB connection - ' + err.stack);
                CommonUtil.returnResponse(false, HTTPStatus.INTERNAL_SERVER_ERROR, '', '', '', res);
            } else {
                var newUser = new UserModel();
                validateData.isCreateUserRequestDataValid(req.body, function (status){
                    if (status) {
                        newUser.login = req.body.login;
                        UserModel.checkTenantLoginExists(dbConn, newUser, true, function (err) {
                            if(err){
                                CommonUtil.returnResponse(dbConn, HTTPStatus.CONFLICT, '', errorConfig.loginAlreadyExists, 'login', res);
                            }else{

                                newUser.firstName = req.body.firstName;
                                newUser.lastName = req.body.lastName;

                                newUser.status = 'Active';
                                newUser.country = req.body.country;
                                newUser.state = req.body.state;
                                newUser.city = req.body.city;
                                newUser.postalCode = req.body.postalCode;
                                newUser.role = req.body.role;
                                UserModel.createUser(dbConn, newUser, function (err, ref) {
                                    if (err){
                                        CommonUtil.returnResponse(dbConn, HTTPStatus.INTERNAL_SERVER_ERROR, '', '', '', res);
                                    }else{
                                        newUser.referenceUUID = ref;
                                        var consolidatedTemplatevalues ={
                                            MESSAGECONTENT1:"Hi "+newUser.firstName,
                                            URL:baseURL+newUser.referenceUUID+"/verify"
                                        };
                                        var templatePath="registration-confirm-email-template.html";

                                        smtpClient.getSMTPTransporter(emailConfig.host, emailConfig.port, false, emailConfig.userName, emailConfig.password).then((transporter) => {

                                            smtpClient.replaceValues(templatePath, consolidatedTemplatevalues).then((htmlEmail) => {
                                            logger.msg('INFO', 'v1', 'v1', 'emailUtil', 'send', 'Going to invoke SMTP Client. Template path is '+htmlEmail);
                                            var  mailOptions = {
                                                from: emailConfig.userName, // sender address - Read it from config
                                                to: newUser.login, // list of receivers,
                                                html: htmlEmail,
                                                subject : "New User Registration"
                                            };
                                        //return smtpClient.send(transporter, mailOptions);
                                        smtpClient.send(transporter, mailOptions);
                                        CommonUtil.returnResponse(dbConn, HTTPStatus.CREATED, {reference: newUser.referenceUUID}, '', '', res);
                                    }, (err) => {
                                            logger.msg('ERROR', '', '', 'emailUtil', 'send', 'ERROR encountered in sending email '+err);
                                        });
                                    }, (err) => {
                                            logger.msg('ERROR', '', '', 'emailUtil', 'send', 'ERROR encountered in connecting the SMTP server '+err);
                                        });

                                    }
                                });
                            }
                        });
                    } else {
                        logger.msg('INFO', 'v1', '', '', 'POST ', 'Encountered Bad request while creating the users');
                        CommonUtil.returnResponse(dbConn, HTTPStatus.BAD_REQUEST, '', '', '', res);
                    }
                });
            }
        });
    });

    /*
            Generates the signature for the given referenceUUID
     */
    server.get('/user/:referenceUUID/verify',function(req,res){
        var referenceUUID=req.params.referenceUUID;
        nconf.file({file: 'config/settingsConfig.json'});
        var emailConfig = nconf.get('emailConfig');
        if (Object.keys(req.query).length === 0){
            DBUtil.getConnection(function (err, dbConn){
                if (err) {
                    CommonUtil.returnResponse(false, HTTPStatus.INTERNAL_SERVER_ERROR, '', '', '', res);
                }else{
                    var userModel = new UserModel();
                    userModel.referenceUUID = referenceUUID;
                    UserModel.getUserDetailsByRef(dbConn, userModel, function (err, resultSet){
                        if(err){
                            CommonUtil.returnResponse(false, HTTPStatus.NOT_FOUND, '', '', '', res);
                        }else{
                            userModel.login=resultSet.LOGIN;
                            userModel.userIID = resultSet.USER_IID;
                            userModel.loginSignature = uuid.v4();

                            UserModel.updateUser(dbConn, userModel,function (err, referenceUUID){
                                if (err) {
                                    CommonUtil.returnResponse(false, HTTPStatus.INTERNAL_SERVER_ERROR, '', '', '', res);
                                }
                                else{
                                    //CommonUtil.returnResponse(dbConn, HTTPStatus.OK, {login:userModel.login,loginSignature:userModel.loginSignature}, '', '', res);
                                    var consolidatedTemplatevalues ={
                                        MESSAGECONTENT1:"Hi "+resultSet.FIRST_NAME,
                                        SIGNATURE:userModel.loginSignature
                                    };
                                    var templatePath="signature-email-template.html";

                                    smtpClient.getSMTPTransporter(emailConfig.host, emailConfig.port, false, emailConfig.userName, emailConfig.password).then((transporter) => {

                                        smtpClient.replaceValues(templatePath, consolidatedTemplatevalues).then((htmlEmail) => {
                                        logger.msg('INFO', 'v1', 'v1', 'emailUtil', 'send', 'Going to invoke SMTP Client. Template path is '+htmlEmail);
                                        var  mailOptions = {
                                            from: emailConfig.userName, // sender address - Read it from config
                                            to: userModel.login, // list of receivers,
                                            html: htmlEmail,
                                            subject : "Signature for passwordLess login"
                                        };
                                        smtpClient.send(transporter, mailOptions);
                                        CommonUtil.sendResponseWoBody(res, HTTPStatus.OK);
                                        }, (err) => {
                                                logger.msg('ERROR', '', '', 'emailUtil', 'send', 'ERROR encountered in sending email '+err);
                                            });
                                        }, (err) => {
                                                logger.msg('ERROR', '', '', 'emailUtil', 'send', 'ERROR encountered in connecting the SMTP server '+err);
                                            });

                                }


                            });
                        }


                    });
                }
            });
        }else {
            logger.msg('ERROR', 'v1', 'V1', 'v1', 'GET User/:referenceUUID', 'query string is  not accepted for this request - ' + err.stack);
            CommonUtil.returnResponse(false, HTTPStatus.BAD_REQUEST, '', '', '', res);
        }
    });

    server.post('/user/:referenceUUID/login',function(req,res){
        var referenceUUID=req.params.referenceUUID;
        nconf.file({file: 'config/settingsConfig.json'});
        var emailConfig = nconf.get('emailConfig');
        var errorConfig = nconf.get('errorConfig');
        if (Object.keys(req.query).length === 0){
            DBUtil.getConnection(function (err, dbConn){
                if (err) {
                    CommonUtil.returnResponse(false, HTTPStatus.INTERNAL_SERVER_ERROR, '', '', '', res);
                }else{
                    var userModel = new UserModel();
                    userModel.referenceUUID = referenceUUID;
                    UserModel.getUserDetailsByRef(dbConn, userModel, function (err, resultSet){
                        if(err){
                            CommonUtil.returnResponse(false, HTTPStatus.NOT_FOUND, '', '', '', res);
                        }else{
                            userModel.login=req.body.login;
                            userModel.loginSignature = req.body.signature;

                            //UserModel.updateUser(dbConn, userModel,function (err, referenceUUID){
                            UserModel.checkValidUser(dbConn, userModel, function (err, referenceUuid){
                                if (err) {
                                    if (referenceUuid){
                                        CommonUtil.returnResponse(dbConn, HTTPStatus.CONFLICT, '', errorConfig.invalidCredentials, '',  res);
                                    }else{
                                        CommonUtil.returnResponse(false, HTTPStatus.INTERNAL_SERVER_ERROR, '', '', '', res);
                                    }
                                }
                                else{
                                    //CommonUtil.returnResponse(dbConn, HTTPStatus.OK, {login:userModel.login,loginSignature:userModel.loginSignature}, '', '', res);
                                    logger.msg('INFO', 'v1', 'V1', 'v1', 'login', 'Authentication is fine' );
                                    var result=
                                    {
                                        firstName:resultSet.FIRST_NAME,
                                        lastName:resultSet.LAST_NAME,
                                        role:resultSet.ROLE,
                                        country:resultSet.COUNTRY,
                                        state:resultSet.STATE,
                                        city:resultSet.CITY,
                                        postalCode:resultSet.POSTAL_CODE
                                    };
                                    userModel.userIID=resultSet.USER_IID;
                                    userModel.loginSignature = '';      // Re-setting the signature, so that signature will be used only one time
                                    UserModel.updateUser(dbConn, userModel,function (err, referenceUUID){
                                        CommonUtil.returnResponse(dbConn, HTTPStatus.OK, result, '', '', res);
                                    });

                                }


                            });
                        }


                    });
                }
            });
        }else {
            logger.msg('ERROR', 'v1', 'V1', 'v1', 'GET User/:referenceUUID', 'query string is  not accepted for this request - ' + err.stack);
            CommonUtil.returnResponse(false, HTTPStatus.BAD_REQUEST, '', '', '', res);
        }
    });
};
