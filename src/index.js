'use strict';

var kraken = require('kraken-js'),
    logger = require('./lib/logUtil'),
    dbUtil = require('./lib/dbUtil'),
    requestController = require('./lib/requestController'),
    cryptUtil = require('./lib/cryptUtil'),
    nconf = require('nconf').file({file: 'config/config.json'}),
    express = require('express'),
    options, app;


options = {
    onconfig: function (config, next) {
        /*
         * Add any additional config setup or overrides here. `config` is an initialized
         * `confit` (https://github.com/krakenjs/confit/) configuration object.
         */
        logger.config(nconf.get('loggerConfig'));
        var dbConfig=nconf.get('dbConfig');
        dbConfig.password=cryptUtil.decrypt(nconf.get('dbConfig').password);
        dbUtil.config(dbConfig);
        next(null, config);
    }
};

app = module.exports = express();
app.use(kraken(options));
app.on('start', function () {
    logger.msg('INFO', 'Index(Main)', '', '', 'start', 'Application ready to serve requests.');
});
