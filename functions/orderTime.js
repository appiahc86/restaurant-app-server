const moment = require("moment");


const orderTime = () => {

    const today = moment().day();

    //If is Sunday
    if (today === 0) return false;

    //From Monday to Thursday
    if (today === 1 || today === 2 || today === 3 || today === 4){
        return moment().hour() > 15 && moment().hour() < 23;
    }

    //Friday and Saturday
    if (today === 5 || today === 6){
        return moment().hour() > 15;
    }

    return false;

}



module.exports = orderTime;