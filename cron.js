const cron = require('cron');
const db = require("./config/db");
const config = require("./config/config");
const axios = require("axios");
const logger = require('./winston');

const transactionJob = new cron.CronJob('*/3 * * * *', async () => { // This function will be executed every 3 minutes
    try {



    }catch (e) {
        logger.info('cron job')
        logger.info(e);
    }

});


module.exports = transactionJob;