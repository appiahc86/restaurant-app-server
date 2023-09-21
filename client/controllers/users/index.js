const db = require("../../../config/db");
const logger = require("../../../winston");

const userIndexController = {

    //Update User
    update: async (req, res) => {
    
        try {

            const { name, phone, deliveryAddress } = req.body;

            console.log(req.body)
            console.log(req.user)

            await db("users").where("id", req.user.id)
                .update({
                    name,
                    phone,
                    deliveryAddress
                })
            return res.status(200).end();

        }catch (e) {
            logger.error('client, user index updateUser');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
        }
    },
}

module.exports = userIndexController;