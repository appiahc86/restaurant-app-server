const db = require("../../../config/db");

const  logger = require("../../../winston");
const moment = require("moment");
const {generateRandomNumber} = require("../../../functions");

const dashboardUsers = {

    //Get all users
    index: async (req, res) => {
        try {

            const users = await db("adminusers")
                .select("id","name","email", "role", "isActive")
                .where("email", "<>", req.user.email)

            res.status(200).json({users: users});

        }catch (e) {
            logger.error('admin, users, index, index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
        }
    },

    //Add user
    create: async (req, res) => {
        try {
            const {name, email, role} = req.body;

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (name.trim().length < 4) return res.status(400).send("Der Name muss mindestens vier Zeichen lang sein");
            if (!email.trim()) return res.status(400).send("Bitte E-Mail-Adresse angeben");
            if (!email.match(emailRegex)) return res.status(400).send("Bitte geben Sie eine gültige E-Mail-Adresse ein");
            if (role.toString() !== "1" && role.toString() !== "4" && role.toString() !== "5"){
                logger.info("User role tempered with in admin create user");
                return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
            }

            const specialCode = generateRandomNumber();

            //save to db
             await db("adminusers").insert({
                name,
                email: email.toLowerCase(),
                role,
                password: "$2a$10$Cr3fGxuNcFc0AhTuVvjDDOChtK77DBjH7wKtUhV5R5zgVRM.GqKK6",
                specialCode,
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
            });


            res.status(201).end();

        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY')
                return res.status(400).send('Entschuldigung, dieser Benutzer existiert bereits');
            logger.error('admin, users, index, create');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
        }
    },

    //View user
    view: async (req, res) => {
        try {
            const { id } = req.body;

           const user =  await db("adminusers")
               .select("id", "name","email","role", "isActive")
               .where("id", id).limit(1);

            res.status(200).json({user: user[0]});

        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY')
                return res.status(400).send('Entschuldigung, dieser Benutzer existiert bereits');
            logger.error('admin, users, index, view');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
        }
    },

    //Edit user
    edit: async (req, res) => {
        try {
            const {id, name, email, role, isActive} = req.body;


            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (name.trim().length < 4) return res.status(400).send("Der Name muss mindestens vier Zeichen lang sein");
            if (!email.trim()) return res.status(400).send("Bitte E-Mail-Adresse angeben");
            if (!email.match(emailRegex)) return res.status(400).send("Bitte geben Sie eine gültige E-Mail-Adresse ein");
            if (role.toString() !== "1" && role.toString() !== "4" && role.toString() !== "5"){
                logger.info("User role tempered with in admin create user");
                return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
            }

            const specialCode = generateRandomNumber();

            //Edit in db
            await db("adminusers")
                .where("id", id)
                .update({
                name,
                email: email.toLowerCase(),
                role,
                isActive: !!isActive
            });

            res.status(200).end();

        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY')
                return res.status(400).send('Entschuldigung, dieser Benutzer existiert bereits');
            logger.error('admin, users, index, edit');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich");
        }
    },



}


module.exports = dashboardUsers;