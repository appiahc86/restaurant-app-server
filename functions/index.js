const moment = require("moment");

//Generate random 6 digits
const generateRandomNumber = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

const generateReferenceNumber = (date) => {
    let year = moment(date).year();
    let month = moment(date).month() + 1;
    month = month < 10 ? `0${month}` : month;
    let day = moment(date).date();
    day = day < 10 ? `0${day}` : day;
    let hour = moment(date).hours();
    hour = hour < 10 ? `0${hour}` : hour;
    let minutes = moment(date).minutes();
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    let seconds = moment(date).seconds();
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    let milliseconds = moment(date).milliseconds();
    milliseconds = milliseconds < 10 ? `0${milliseconds}` : milliseconds;

    return `${year}${month}${day}${hour}${minutes}${seconds}${milliseconds}-`;
}

module.exports = {
    generateRandomNumber, generateReferenceNumber
}