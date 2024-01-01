const db = require("../../../config/db");
const logger = require("../../../winston");

const zipCodesController = {

    //Get all zipcodes
    index: async (req, res) => {
        try{
            const zipCodes = await db("zipCodes");

            return res.status(200).send({zipCodes});

        }catch (e) {
            logger.error('admin, controllers zipcodes index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get all zipcodes


    //Create
    create: async (req, res) => {

        try{
            const { zipCode, town, minOrder, deliveryFee } = req.body;

            //Save to db
            const query = await db('zipcodes').insert({
                zipCode, town, minOrder, deliveryFee
            });

            return  res.status(201).end();


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Leider existiert dieser Datensatz bereits'); //Sorry, this record already exists
            logger.error('admin, controllers zipcodes create');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },// ./Create


    //View
    view: async (req, res) => {

        try{

            const zipcode = await db('zipcodes')
                .where("id", req.body.id).limit(1);

            return  res.status(200).send({zipcode});


        }catch (e) {
            logger.error('admin, controllers zipcodes View');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },// ./View


    //Edit
    edit: async (req, res) => {

        try{
            const { id, zipCode, town, minOrder, deliveryFee } = req.body;


            //Edit in db
            await db('zipcodes').where('id', id )
                .update({
                    zipCode,
                    town,
                    minOrder,
                    deliveryFee
                });

            return  res.status(200).end();


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Leider existiert dieser Datensatz bereits'); //Sorry, this record already exists
            logger.error('admin, controllers zipcodes edit');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },// ./Edit



    //Delete
    destroy: async (req, res) => {
        try{
            const { id } = req.body;

            await db('zipcodes').where('id', id).del();

            return res.status(200).end();

        }catch (e) {
            logger.error('admin, controllers zipcodes destroy');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }

}


module.exports = zipCodesController;