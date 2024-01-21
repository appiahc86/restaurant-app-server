const logger = require("../../winston");

const isDeliveryPerson = async (req, res, next) => {


    try {
        if (req.user.role.toString() === "5"){
            return next();
        }
        else {
            res.status(400).send("Leider haben Sie keine Berechtigung für diese Ressource");
        }
    }catch (e) {
        logger.error("isDeliveryPerson Middleware");
        logger.error(e);
        res.status(401).send("Bitte loggen Sie sich ein");
    }

}


module.exports =  isDeliveryPerson;