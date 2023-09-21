const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment");
const fs = require('fs');
const path = require('path');
const slugify = require("slugify");
const uploadDir = path.join(__dirname, '../../../public/images/menu/');

const menuController = {

    //Get all menu
    index: async (req, res) => {
        try{
            const menu = await db.select('id', 'name', 'image').from('menu');

            const path = process.env.NODE_ENV !== 'production' ? `http://${req.headers.host}/images/menu/`
                : `https://${req.headers.host}/images/menu/`;

               return res.status(200).send({menu, path});

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
            let image = null;
            let imgName = "";

            if (req.files) {
                image = req.files.image;
                 imgName = name.replaceAll(' ', '') + moment().format() + image.mimetype.replace('image/', '.')
                    image.mv(uploadDir + imgName, (err) => {
                        if (err) return res.status(400).send("Leider war der Upload nicht erfolgreich"); //Sorry, upload was not successful
                    });
            }

            //Validate here

            const slug = slugify(
                `${name}`,
                {lower: true}
            )

            //Save to db
            const menu = await db('menu').insert({
                name,
                slug,
                image: imgName
            });

            const path = process.env.NODE_ENV !== 'production' ? `http://${req.headers.host}/images/menu/`
                : `https://${req.headers.host}/images/menu/`;

               return  res.status(201).send(
                   {
                       id: menu[0],
                       path,
                       image: imgName
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
            let image = null;
            let imgName = "";



            if (req.files) {
                //Remove old image first
                if (req.body.oldImage.trim()){
                    fs.unlink(uploadDir + req.body.oldImage, (err) => {
                        if (err) {
                            logger.error(err);
                        }
                    });
                }

                //Insert new image
                image = req.files.image;
                imgName = name.replaceAll(' ', '') + moment().format() + image.mimetype.replace('image/', '.')
                image.mv(uploadDir + imgName, (err) => {
                    if (err) return res.status(400).send("Leider war der Upload nicht erfolgreich"); //Sorry, upload was not successful
                });
            }

            //Validate here

            const slug = slugify(
                `${name}`,
                {lower: true}
            )

            //Edit in db
            if (req.files){
                await db('menu').where('id', id )
                    .update({
                        name,
                        slug,
                        image: imgName
                    });
            }else {
                await db('menu').where('id', id )
                    .update({
                        name,
                        slug
                    });
            }


            const path = process.env.NODE_ENV !== 'production' ? `http://${req.headers.host}/images/menu/`
                : `https://${req.headers.host}/images/menu/`;

            return  res.status(200).send(
                {
                    name,
                    path,
                    image: imgName
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
            const { id, image } = req.body;

            //delete image from  disk
            if (image){
                fs.unlink(uploadDir + image, (err) => {
                    if (err) {
                        logger.error(err);
                    }
                });
            }

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