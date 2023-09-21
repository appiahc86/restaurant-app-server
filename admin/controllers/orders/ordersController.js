const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment");
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '../../../public/images/menuItems/');

const ordersController = {


    //Get today's orders
    index: async (req, res) => {
        try{

            console.log('orders')

            return res.status(200).send('ok');

        }catch (e) {
            logger.error('admin, controllers ordersController index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get all menu


}


module.exports = ordersController;