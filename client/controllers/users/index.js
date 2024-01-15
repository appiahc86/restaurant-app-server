const db = require("../../../config/db");
const logger = require("../../../winston");

const userIndexController = {

    //Update User
    update: async (req, res) => {
    
        try {

            const { name, deliveryAddress } = req.body;

            const query = await db("zipcodes")
                .where("zipCode", deliveryAddress.postCode).limit(1);

            if (!query.length){
                //Sorry, we do not deliver to this address
                return res.status(400).send('Leider liefern wir nicht an diese Adresse');
            }

            deliveryAddress.town = query[0].town;

            await db("users").where("id", req.user.id)
                .update({
                    name,
                    deliveryAddress: JSON.stringify(deliveryAddress)
                })

            return res.status(200).send({deliveryAddress});

        }catch (e) {
            logger.error('client, user index updateUser');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
        }
    },
}

module.exports = userIndexController;