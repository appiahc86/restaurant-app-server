const db = require("../../config/db");
const logger = require("../../winston");
const moment = require("moment");

const dashboardController = {
    index: async (req, res) => {
        try{

            const startOfYear = `${moment().year()}-01-01`;
            const today = moment().format("YYYY-MM-DD");
            console.log(today)




            return res.status(200).send({
                boom: ""
            })
        }catch (e) {
            logger.error('admin, controllers dashboardController index');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    }
}


module.exports = dashboardController;