const { Resend }  = require("resend");
const config = require("../config/config");
const  logger = require("../winston");
const ejs = require("ejs");

const sendOrderEmail = async (to, content) => {

    try { //TODO change double back slashes before deployment
        ejs.renderFile(__dirname + '\\orderMail.ejs', { to, content }, async (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const resend = new Resend(config.RENDER_API_KEY);

                await resend.emails.send({
                    from: 'Pizza Wunderbar <info@nantylotto.com>',
                    to: [`${to}`],
                    subject: 'Bestellbestätigung',
                    html: data
                });
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