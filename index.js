require('dotenv').config({silent: true});

let logger = require('winston');
let fs = require('fs');
let Promise = require('bluebird');
let dns = require('dns');

Promise.promisifyAll(fs);
Promise.promisifyAll(dns);

let Config = require('./lib/config');
let Proxy = require('./lib/proxy');
let WebUI = require('./lib/webui');
let Utils = require('./lib/utils');

let config = new Config().load();

logger.level = config.loglevel;

let utils = new Utils(config);

dns.lookupAsync(require('os').hostname())
.then(add => {
    config.ip = add;
    logger.info('Listening to: %s:%s', add, config.proxy.port);
})
.then(() => {
    return utils.initFolders();
})
.then(() => {
    let proxy = new Proxy(config);
    proxy.launch();
})
.then(() => {
    let webui = new WebUI(config);
    webui.launch();
});
