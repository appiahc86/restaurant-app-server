const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment");

const settingsController = {
    index: async (req, res) => {
        try{

            const settings = await db('settings').where("id", 1)
                .select("appConfig");

            return res.status(200).send({
                settings: JSON.parse(settings[0].appConfig)
            })

        }catch (e) {
            logger.error('admin, controllers settingsController index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },

    //Toggle AllowOrders
    toggleAllowOrders: async (req, res) => {
        try{

            const { allowOrders } = req.body;

            const query = await db('settings').where("id", 1)
                .select("appConfig");

            const settings = JSON.parse(query[0].appConfig);

            settings.allowOrders = allowOrders;

            //Save to db
            await  db('settings')
                .where("id", 1)
                .update({
                    appConfig: JSON.stringify(settings)
                })

            return res.status(200).send({allowOrders});

        }catch (e) {
            logger.error('admin, controllers settingsController toggleAllowOrders');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },


}


module.exports = settingsController;