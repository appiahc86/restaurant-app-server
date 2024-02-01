const axios = require("axios");
const config = require("../config/config");


const sendOrderSms = async (phone, orderId) => {
    try {
        const response = await axios.post("https://dkegk8.api.infobip.com/sms/2/text/advanced",
            JSON.stringify({
                messages: [
                    {
                        destinations: [{to: `49${phone}`}],
                        from: "ServiceSMS",
                        text:  `Vielen Dank, Ihre Bestellung ist mit der Bestell-ID ${orderId} eingegangen`
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



    }catch (e) {
        logger.error("order sms error");
        logger.error(e);
    }
}

module.exports = sendOrderSms;