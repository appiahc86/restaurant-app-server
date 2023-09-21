const { Resend }  = require("resend");
const config = require("../config/config");
const  logger = require("../winston");

module.exports = {
    //Send password reset mail
    passwordResetMail: async (to, code) => {
        try {
            const resend = new Resend(config.RENDER_API_KEY);

            await resend.emails.send({
                from: 'Pizza Wunderbar <info@nantylotto.com>',
                to: [`${to}`],
                subject: 'Password Reset',
                html:
                    `<p>Bitte verwenden Sie den untenstehenden Code, um Ihr Passwort zurückzusetzen</p>
                    <br>
                        <h1 style="text-align: center; font-weight: bold;"><mark>${code}</mark></h1>`
            });

            return true;

        }catch (e) {
            logger.error('Email not sent');
            logger.error(e);
            return false;
        }

    }
}


