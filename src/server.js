'use strict';

var app = require('./index');
var http = require('http');
var nconfPort = require('nconf').file({ file: 'config/config.json' });
var logger = require('./lib/logUtil');
var cluster = require('cluster');
var server;


//Clustering - START
if (cluster.isMaster) {
    //var numWorkers = 1; //require('os').cpus().length;
    var numWorkers = require('os').cpus().length;
    logger.msg('INFO', 'index(Main)', '', '', 'listening', 'Master cluster setting up ' + numWorkers + ' workers...');
    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }
    cluster.on('online', function (worker) {
        logger.msg('INFO', 'index(Main)', '', '', 'listening', 'Worker ' + worker.process.pid + ' is online');
    });
    cluster.on('exit', function (worker, code, signal) {
        logger.msg('INFO', 'index(Main)', '', '', 'listening', 'Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        logger.msg('INFO', 'index(Main)', '', '', 'listening', 'Starting a new worker');
        cluster.fork();
    });
} else {
    server = http.createServer(app);
    server.listen(process.env.PORT || nconfPort.get('port'));
    server.on('listening', function () {
        logger.msg('INFO', 'index(Main)', '', '', 'listening', 'Server listening on port:' + this.address().port);
    });
}
//Clustering - END
