const db = require("../../config/db");
const logger = require("../../winston");
const config = require("../../config/config")
const {calculateOrder} = require("../../functions/calculateOrder");
const {generateRandomNumber} = require("../../functions");
const stripe = require('stripe')(`${config.STRIPE_SECRET_KEY}`);
const CryptoJS = require("crypto-js");
const axios = require("axios");
const orderTime = require("../../functions/orderTime");

const indexController = {

    getAllZipCodes: async (req, res) => {
        try{

            const zipcodes = await db("zipcodes")

            return res.status(200).json({zipcodes});

        }catch (e) {
            logger.error('client, controllers getAllZipcodes');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get all zipcodes


    //Get one zipcode
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
    }, // ./get One zipcodes


    //Generate Payment Intent
    paymentIntent: async (req, res) => {
        try {

            const {cart, deliveryAddress, note} = req.body;

            const processedData = await calculateOrder(cart, deliveryAddress, "cc", note);
            if (processedData.error){
                return res.status(400).json(processedData.error);
            }


            const paymentIntent = await stripe.paymentIntents.create({
                amount: (processedData.total * 100).toFixed(0),
                currency: 'eur',
                payment_method_types: ['card'],
            });

            res.status(200).send({
                clientSecrete: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            })
        }catch (e) {
            logger.error('client, controllers paymentIntent');
            logger.error(e.message);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }

    },


    //Request SMS
    requestSms: async (req, res) => {
        try{

            //***********Check if orders are allowed*************

            const canPlaceOrder = orderTime();
            if (!canPlaceOrder) return res.status(400)
                .json("Entschuldigung, die Bestellungen sind derzeit geschlossen");

            const settingsQuery = await db("settings")
                .where("id", 1)
                .select("appConfig");

            const result = JSON.parse(settingsQuery[0].appConfig);
            if (!result.allowOrders) return res.status(400)
                .json("Bestellungen sind derzeit leider nicht möglich. Bitte versuchen Sie es später noch einmal.");



            const code = generateRandomNumber();

            const encryptedVerificationCode = CryptoJS.AES.encrypt(`${code}`, 'secretKey@').toString();

            if (process.env.NODE_ENV !== 'production'){
                return res.status(200).json({code: CryptoJS.AES.encrypt(`202020`, 'secretKey@').toString()});
            }


            const response = await axios.post("https://dkegk8.api.infobip.com/sms/2/text/advanced",
                JSON.stringify({
                    messages: [
                        {
                            destinations: [{to: `49${req.body.phone}`}],
                            from: "ServiceSMS",
                            text:  `Bestätigungscode: ${code}`
                        }
                    ]
                }),

                {
                    headers:{
                        'Accept': 'application/json',
                        'Authorization': `App ${config.SMS_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                },

                )


            if (response.status === 200){
                res.status(200).json({code: encryptedVerificationCode});
            }else {
                logger.error('Verification SMS Error');
                res.status(400).json("Error occurred");
            }


        }catch (e) {
            logger.error('client, controllers request SMS');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }

}


module.exports = indexController;