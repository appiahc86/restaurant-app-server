const logger = require("../../winston");

const isAdmin = async (req, res, next) => {


    try {
        if (req.user.role.toString() === "1"){
            return next();
        }
        else {
            res.status(403).send("Leider haben Sie keine Berechtigung für diese Ressource");
        }
    }catch (e) {
        logger.error("isAdmin Middleware");
        logger.error(e);
        res.status(400).send("Bitte loggen Sie sich ein");
    }

}


module.exports =  isAdmin;