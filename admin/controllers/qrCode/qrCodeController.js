const db = require("../../../config/db");
const logger = require("../../../winston");

const qrCodeController = {

    //Scan QR code
    scan: async (req, res) => {
        try{

            const order = await db("orders")
                .select("id", "deliveryStatus")
                .where("id", req.body.code)
                .limit(1);

            if (!order.length)
                return res.status(400).send("Leider wurde dieser Datensatz nicht gefunden");

            if (order[0].deliveryStatus === "delivered" || order[0].deliveryStatus === "canceled"){
                return res.status(200).end();
            }else {
                await db("orders")
                    .where("id",  req.body.code)
                    .update({deliveryStatus: "delivered"})

                await db("deliveries")
                    .insert({
                        userId: req.user.id,
                        orderId: order[0].id
                    })

                return res.status(200).end();
            }




        }catch (e) {
            logger.error('admin, controllers qrcode');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }

}


module.exports = qrCodeController;