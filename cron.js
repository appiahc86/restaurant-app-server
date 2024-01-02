const cron = require('cron');
const db = require("./config/db");
const config = require("./config/config");
const axios = require("axios");
const fetch =  require("node-fetch");
const logger = require('./winston');
const stripe = require('stripe')(config.STRIPE_SECRET_KEY);

const PAYPAL_CLIENT_ID = config.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = config.PAYPAL_CLIENT_SECRET;
const base = config.PAYPAL_BASE;



//Paypal Access Token
const generateAccessToken = async () => {
try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        logger.error("Cron Job, MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
        PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
    ).toString("base64");

    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    const data = await response.json();
    return data.access_token;
} catch (error) {
    logger.error("Failed to generate Paypal Access Token:", error);
}
};




const transactionJob = new cron.CronJob('*/1 * * * *', async () => { // This function will be executed every 3 minutes
    try {

        const pendingTransactions = await db("payments")
            .where("status", "pending")
            .select("id", "extReference", "paymentMethod", "orderId")
            .limit(6)

        if (pendingTransactions.length){
            for (const pend of pendingTransactions) {


    //***************************** If Paypal payment *******************************************
                if (pend.paymentMethod === "paypal"){

                    const accessToken = await generateAccessToken();
                    const response = await fetch(`${base}/v2/checkout/orders/${pend.extReference}`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        method: "GET",
                    });

                    const jsonResponse = await response.json();


                    //If Payment is successful
                    if (jsonResponse.status === "COMPLETED"){
                        await db("payments")
                            .where("id", pend.id)
                            .update({status: "successful"})
                    }

                    //If Payment is Not successful
                    if (
                        jsonResponse.status === "DENIED" ||
                        jsonResponse.status === "EXPIRED" ||
                        jsonResponse.status === "FAILED"
                    ){

                            await db("payments")
                                .where("id", pend.id)
                                .update({status: "failed"})

                    }

                    //If Resource does not exist
                    if (jsonResponse.name === "RESOURCE_NOT_FOUND"){

                         //Delete order from Db
                            await db("orders").where("id", pend.orderId).del();

                    }  // ./If Resource does not exist


                } // ./Paypal payment







  //***************************If Credit card payment*******************************
                if (pend.paymentMethod === "cc"){

                    const { status } = await stripe.paymentIntents.retrieve(pend.extReference);

                    //if successful payment
                    if (status.toLocaleLowerCase() === "succeeded"){
                        await db('payments').where('id', pend.id)
                            .update({status: 'successful'})
                    }

                    //if failed payment
                    if (status === "failed"){
                        await db('payments').where('id', pend.id)
                            .update({status: 'failed'})
                    }

                    

                }// ./Credit Card payment







            }
        }



    }catch (e) {
        logger.error('cron job')
        logger.error(e);
    }

});


module.exports = transactionJob;