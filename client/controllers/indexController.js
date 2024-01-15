const db = require("../../config/db");
const logger = require("../../winston");
const config = require("../../config/config")
const {calculateOrder} = require("../../functions/calculateOrder");
const stripe = require('stripe')(`${config.STRIPE_SECRET_KEY}`);

const indexController = {

    //Get zipcode
    getZipcode: async (req, res) => {
        try{

            const zipcode = await db("zipcodes")
                .where("zipCode", req.body.zipcode).limit(1);

            return res.status(200).send({zipcode});

        }catch (e) {
            logger.error('client, controllers getZipcodes');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get all zipcodes


    //Generate Payment Intent
    paymentIntent: async (req, res) => {
        try {


            const {cart, deliveryAddress, note} = req.body;


            const processedData = await calculateOrder(cart, deliveryAddress, "cc", note);
            if (processedData.error){
                return res.status(400).json(processedData.error);
            }


            const paymentIntent = await stripe.paymentIntents.create({
                amount: processedData.total * 100,
                currency: 'eur',
                payment_method_types: ['card'],
            });

            res.status(200).send({
                clientSecrete:paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            })
        }catch (e) {
            logger.error(e);
            logger.error('client, controllers paymentIntent');
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }

    },


}


module.exports = indexController;