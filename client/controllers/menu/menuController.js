const db = require("../../../config/db");
const logger = require("../../../winston");


const menuController = {
    //Get all menu
    index: async (req, res) => {
        try{
            const menu = await db.select( 'name', 'slug').from('menu');
            return res.status(200).send({menu});

        }catch (e) {
            logger.error('client, controllers menu index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get all menu

}

module.exports = menuController;