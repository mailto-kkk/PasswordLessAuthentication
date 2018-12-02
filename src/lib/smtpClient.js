'use strict';
var fs =  require('fs');
const nodemailer = require('nodemailer');
var Q = require('q');
var logger = require("./logUtil");
var emailTemplateFolder = 'emailTemplates';
exports.getSMTPTransporter = function(host, port, secure, username, password) {
    var d = Q.defer();
    let transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure, // true for 465, false for other ports
        auth: {
            user: username,
            pass: password
        },
        tls: {rejectUnauthorized: false}
    }, (err) => {
            logger.msg('ERROR', '', '', 'smtpClient', 'getSMTPTransporter', 'ERROR encountered in connecting the SMTP server '+err);
    });
    d.resolve(transporter);
    return d.promise;
}

exports.send = function(transporter, mailOptions) {
    var d = Q.defer();
    logger.msg('INFO', '', '', 'smtpClient', 'send', 'sending email through SMTP ');
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            logger.msg('ERROR', '', '', 'smtpClient', 'send', 'SMTP server throwing error'+JSON.stringify(error));
            return console.log(error);
        }else{
            logger.msg('INFO', '', '', 'smtpClient', 'send', 'email sent successfully.');
            d.resolve();
        }


    });
    return d.promise;
};

exports.replaceValues = function(template, values) {
    var d = Q.defer();
    template=emailTemplateFolder+"/"+template;
    fs.readFile(template, 'utf8',function(err, html){
        if(err){
            logger.msg('ERROR', '', '', 'smtpClient', 'replaceValues', 'error while reading the template '+JSON.stringify(err));
            return console.log(err);
        }
        logger.msg('INFO', 'v1', 'v1', 'smtpClient', 'replaceValues', 'Reading the values from template');
        Object.keys(values).forEach(function(key) {
          var val = values[key];
          //html = html.replace("#{" + key + "}", val);
            html = html.replace("*|" + key + "|*", val);
        });

        d.resolve(html);
    });
    return d.promise;
};

