const db = require("../../../config/db");
const logger = require("../../../winston");
const slugify = require("slugify");

const menuController = {

    //Get all menu
    index: async (req, res) => {
        try{
            const menu = await db.select('id', 'name')
                .from('menu');


               return res.status(200).send({menu});

        }catch (e) {
            logger.error('admin, controllers menu index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get all menu


    //Save menu
    create: async (req, res) => {

        try{
            const name = req.body.name.toLowerCase();


            //Validate here

            const slug = slugify(
                `${name}`,
                {lower: true}
            )

            //Save to db
            const menu = await db('menu').insert({
                name,
                slug
            });

               return  res.status(201).send(
                   {
                       id: menu[0]
                   }
                   );


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Leider existiert dieser Name bereits'); //Sorry, this name already exists
            logger.error('admin, controllers menu create');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },// ./Save menu


    //Edit menu
    edit: async (req, res) => {

        try{
            const id = req.body.id;
            const name = req.body.name.toLowerCase();

            //Validate here

            const slug = slugify(
                `${name}`,
                {lower: true}
            )

            //Edit in db
                await db('menu').where('id', id )
                    .update({
                        name,
                        slug
                    });

            return  res.status(200).send(
                {
                    name
                },
            );


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Leider existiert dieser Name bereits'); //Sorry, this name already exists
            logger.error('admin, controllers menu edit');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },// ./Edit menu



    //Delete menu
    destroy: async (req, res) => {
        try{
            const { id } = req.body;

            await db('menu').where('id', id).del();

            return res.status(200).end();

        }catch (e) {
            logger.error('admin, controllers menu destroy');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }

}


module.exports = menuController;