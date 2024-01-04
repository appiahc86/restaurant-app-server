const { Resend }  = require("resend");
const config = require("../config/config");
const  logger = require("../winston");

module.exports = {
    //Send password reset mail
    passwordResetMail: async (to, code) => {
        try {
            const resend = new Resend(config.RESEND_API_KEY);

            await resend.emails.send({
                from: 'Pizza Wunderbar <info@nantylotto.com>',
                to: [`${to}`],
                subject: 'Passwort zurücksetzen',
                html:
                    `<p>Bitte verwenden Sie den untenstehenden Code, um Ihr Passwort zurückzusetzen</p>
                    <br>
                        <h1 style="text-align: center; font-weight: bold;"><mark>${code}</mark></h1>`
            });

            return true;

        }catch (e) {
            logger.error('Password reset email not sent');
            logger.error(e);
            return false;
        }

    },

    //email verification
    verificationEmail: async (to, token) => {
        try {
            const resend = new Resend(config.RESEND_API_KEY);

            await resend.emails.send({
                from: 'Pizza Wunderbar <info@nantylotto.com>',
                to: [`${to}`],
                subject: 'E-Mail-Verifizierung',
                html:
                    `<p>Sehr geehrter Benutzer, Ihr E-Mail-Bestätigungscode lautet</p>
                    <br>
                        <h1 style="text-align: center; font-weight: bold;"><mark>${token}</mark></h1>`
            });

            return true;

        }catch (e) {
            logger.error('Verification Email not sent');
            logger.error(e);
            return false;
        }

    },
}


