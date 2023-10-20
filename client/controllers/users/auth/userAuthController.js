const db = require("../../../../config/db");
const bcrypt = require("bcryptjs");
const config = require("../../../../config/config");
const jwt = require("jsonwebtoken");
const { generateRandomNumber, getBankCode } = require("../../../../functions");
const axios = require("axios");
const  logger = require("../../../../winston");
const moment = require("moment");
const CryptoJS = require("crypto-js");
const { passwordResetMail } = require("../../../../functions/sendMail")


const userAuthController = {

    //..............Register a new user........................
    create: async (req, res) => {
        const {name, email, password } = req.body;

        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        try {

            //Validation
            if (name.trim().length < 4) return res.status(400).send("Der Name muss mindestens vier Zeichen lang sein");
            if (!email.trim()) return res.status(400).send("Bitte E-Mail-Adresse angeben");
            if (!email.match(emailRegex)) return res.status(400).send("Bitte geben Sie eine gültige E-Mail-Adresse ein");
            if (!password.trim())  return res.status(400).send("Bitte Passwort eingeben");
            if (!password.match(passRegex)) return res.status(400).send("Passwort entspricht nicht der Anforderungen");

            //Hash password
            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(password, salt);
            if (!hash) {
                logger.info("password hash was not successful");
                return res.status(400).send("Entschuldigung, etwas ist schief gelaufen");
            }
            const specialCode = generateRandomNumber();

            //Save to db
           const user = await db("users").insert({
                name,
                email: email.toLowerCase(),
                password: hash,
                specialCode,
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
            });



           const token = jwt.sign({ id: user[0], specialCode }, config.JWT_SECRET);
            res.status(201).send({token: token});


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Entschuldigung, dieser Benutzer existiert bereits');
            logger.error('client, userAuthController create');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");

        } // ./Catch block


    }, // ./Register


    //......................Login...........................
    login: async (req, res) => {
        const {email, password} = req.body;

        try {

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            //Validation
            if (!email.trim()) return res.status(400).send("Bitte E-Mail-Adresse angeben");
            if (!email.match(emailRegex)) return res.status(400).send("Bitte geben Sie eine gültige E-Mail-Adresse ein");

            //find user in db
            const user = await db("users")
                .select('id', 'name', 'email','password',
                     'deliveryAddress', 'specialCode', 'isActive')
                .where("email", email.toLowerCase())
                .limit(1);



            //If user does not exist
            if (!user.length) return res.status(400).send("Leider existiert dieser Benutzer nicht")

            //Compare passwords
            const isMatched = await bcrypt.compareSync(password, user[0].password);

            //If passwords do not match
            if (!isMatched) return res.status(400).send("Entschuldigung, Sie haben ein falsches Passwort eingegeben")


            //if user is not mark as active (account suspended)
            if (!!user[0].isActive === false) return res.status(400).send("Leider ist dieses Konto gesperrt. Bitte wenden Sie sich an den Administrator");

            //Generate JWT token
            const token = jwt.sign({ id: user[0].id, specialCode: user[0].specialCode }, config.JWT_SECRET);

            res.status(200).send({
                token,
                user: {
                    name: user[0].name,
                    email: user[0].email,
                    deliveryAddress: JSON.parse(user[0].deliveryAddress)
                }
            })

        }catch (e) {
            logger.error('client, userAuthController login');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
        } // ./Catch block
    }, // ./Login



        //...............Request password reset code....................
    requestPasswordResetCode: async (req, res) => {
        const { email } = req.body;
        try {


            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


            //Validation
            if (!email.trim()) return res.status(400).send("Bitte E-Mail-Adresse angeben");
            if (!email.match(emailRegex)) return res.status(400).send("Bitte geben Sie eine gültige E-Mail-Adresse ein");

            const user = await db('users').where({email: email.toLowerCase()}).limit(1);
            if (!user.length) return res.status(400).send("Leider existiert dieser Benutzer nicht");


            const code = generateRandomNumber();

            //update password reset code in db
            await db('users').where({email: email.toLowerCase()})
                .update({passwordResetCode: code})


            //...........................Send reset email code to user .....................
            const emailSent = await passwordResetMail(email.toLowerCase(), code);
            if (!emailSent) return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");

            return res.status(200).end();

        }catch (e) {
            logger.error('client, userAuthController requestPasswordResetCode');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
        }
    },



        //............. Reset Password...........................
    resetPassword: async (req, res) => {
        const { email, passwordResetCode, password } = req.body;
        try {

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
            //Validation
            if (!email.trim()) return res.status(400).send("Bitte E-Mail-Adresse angeben");
            if (!email.match(emailRegex)) return res.status(400).send("Bitte geben Sie eine gültige E-Mail-Adresse ein");
            if (!password.match(passRegex)) return res.status(400).send("Passwort entspricht nicht der Anforderungen");
            if (!passwordResetCode) res.status(400).send("Bitte geben Sie den Reset-Code an");

            const query = await db("users").where({email: email.toLowerCase()}).limit(1);
             if (!query.length) res.status(400).send("Leider existiert dieser Benutzer nicht");

             //If user enters wrong password reset code
             if (query[0].passwordResetCode.toString() !== passwordResetCode.toString()) return res.status(400).send("Entschuldigung, Sie haben einen falschen Code eingegeben.");


            //Hash password
            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(password, salt);
            if (!hash) {
                logger.info("password hash was not successful");
                return res.status(400).send("Tut mir leid, dass etwas schief gelaufen ist. Bitte versuchen Sie es später noch einmal");
            }

            const specialCode = generateRandomNumber();

            //Update password in db
            await db('users').where({email: email.toLowerCase()})
                .update({password: hash, specialCode: specialCode, passwordResetCode: ''});


            res.status(200).end();

        }catch (e) {
            logger.error('client, userAuthController resetPassword');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
        }
    }

}

module.exports = userAuthController;