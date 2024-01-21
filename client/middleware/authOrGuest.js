const jwt =  require("jsonwebtoken");
const db = require("../../config/db");
const config = require("../../config/config");
const logger = require("../../winston");




const authOrGuest = async (req, res, next) => {

    try{

        if (!req.header("Authorization")){
            req.isGuest = true;
            return next();
        }

        const token = req.header("Authorization").replace("Bearer ", "");

        if (!!token === false) {
            req.isGuest = true;
            return next();
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await db("users")
            .where({id: decoded.id})
            .select("id", 'email', 'specialCode')
            .limit(1);

        //If user not found
        if (!user.length) {
            req.isGuest = true;
            return next();
        }


        //if special code does not match
        if (parseInt(user[0].specialCode ) !== parseInt(decoded.specialCode)){
             req.isGuest = true;
             return next();
        }


        req.token = token;
        req.user = user[0];
        next();
    }catch (e) {
        logger.error("authOrGuest")
        logger.error(e.message)
        res.status(401).end("Bitte loggen Sie sich ein");
    }
}


module.exports =  authOrGuest;