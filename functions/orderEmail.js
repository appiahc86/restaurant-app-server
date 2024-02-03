const config = require("../config/config");
const  logger = require("../winston");
const ejs = require("ejs");

const Mailjet = require('node-mailjet');

const mailjet = Mailjet.apiConnect(
    config.MAILJET_API_KEY,
    config.MAILJET_API_SECRETE
);

const sendOrderEmail = async (to, content) => {

    try { //TODO change double back slashes before deployment
        ejs.renderFile(__dirname + '/orderMail.ejs', { to, content }, async (err, data) => {
            if (err) {
                logger.error("order email");
                logger.error(err);
            } else {
                await mailjet
                    .post('send', { version: 'v3.1' })
                    .request({
                        Messages: [
                            {
                                From: {
                                    Email: "info@nantylotto.com",
                                    Name: "Pizza Wunderbar"
                                },
                                To: [
                                    {
                                        Email: to,
                                        Name: ""
                                    }
                                ],
                                Subject: "Bestellbestätigung",
                                TextPart: "",
                                HTMLPart: data
                            }
                        ]
                    })
            }


        });
    }catch (e) {
            logger.error('Order Email not sent');
            logger.error(e);
    }


};

module.exports = {
    sendOrderEmail
};