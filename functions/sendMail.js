const config = require("../config/config");
const  logger = require("../winston");

const Mailjet = require('node-mailjet');

const mailjet = Mailjet.apiConnect(
    config.MAILJET_API_KEY,
    config.MAILJET_API_SECRETE
);

module.exports = {
    //Send password reset mail
    passwordResetMail: async (to, code) => {
        try {

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
                            Subject: 'Passwort zurücksetzen',
                            TextPart: "",
                            HTMLPart: `<p>Bitte verwenden Sie den untenstehenden Code, um Ihr Passwort zurückzusetzen</p>
                                   <br>
                             <h1 style="text-align: center; font-weight: bold;"><mark>${code}</mark></h1>`
                        }
                    ]
                })

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
                            Subject: "E-Mail-Verifizierung",
                            TextPart: "",
                            HTMLPart: `<p>Sehr geehrter Benutzer, Ihr E-Mail-Bestätigungscode lautet</p>
                                       <br>
                          <h1 style="text-align: center; font-weight: bold;"><mark>${token}</mark></h1>`
                        }
                    ]
                })

            return true;

        }catch (e) {
            logger.error('Verification Email not sent');
            logger.error(e);
            return false;
        }

    },
}


