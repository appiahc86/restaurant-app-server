const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment");
const slugify = require('slugify')
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '../../../public/images/menuItems/');

const menuItemsController = {


    //Get all menu
    getMenu: async (req, res) => {
        try{
            const menu = await db.select('id', 'name')
                .from('menu');

            return res.status(200).send({menu});

        }catch (e) {
            logger.error('admin, controllers menuItemsController getMenu');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get all menu


    //.................Get all menuItems items............................
    index: async (req, res) => {
        try{

            // const page = req.query.page || 1;
            // const pageSize = req.query.pageSize || 15;

            const menuItems = await db('menuItems')
                .join('menu', 'menuItems.menuId', '=','menu.id')
                .select('menuItems.id', 'menuItems.name', 'menuItems.price',
                    'menuItems.slug','menuItems.image','menu.name as menu'
                )
            //     .limit(pageSize)
            //     .offset((page - 1) * pageSize);
            //
            // const total = await db('menuItems')
            //     .count('* as total')

            return res.status(200).send({
                menuItems,
                // page,
                // pageSize,
                // totalRecords: total[0].total
            });

        }catch (e) {
            logger.error('admin, controllers menuItemsController index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get all menuItems items


    //......................Save menuItems item,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    create: async (req, res) => {

        try{
            const {name, price, choiceOf,
                shortDescription, description, menuId
            } = req.body;


            let image = null;
            let imgName = "";

            if (req.files) {

                image = req.files.image;
                imgName = name.toLowerCase().split(' ').join('')+moment().format() + image.mimetype.replace('image/', '.');
                image.mv(uploadDir + imgName, (err) => {
                    if (err) return res.status(400).send("Leider war der Upload nicht erfolgreich"); //Sorry, upload was not successful
                });
            }

            //Validate here
            const slug = slugify(
                `${name} ${moment().unix()}`,
                {lower: true}
            )

            //Save to db
            await db('menuItems').insert({
                menuId, name, price, shortDescription, image: imgName, description,
                choiceOf, slug, createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
            });

            return  res.status(201).end();


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Leider existiert dieser Name bereits'); //Sorry, this name already exists
            logger.error('admin, controllers menuItemsController create');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },// ./Save menuItem

    //......................query only one item.............................
    view: async (req, res) => {
        try{
            const { slug } = req.body;

            const menuItem = await db('menuItems')
                .where('slug', slug)
                .limit(1);

            const path = process.env.NODE_ENV !== 'production' ? `http://${req.headers.host}/images/menuItems/`
                : `https://${req.headers.host}/images/menuItems/`;


            return res.status(200).send({menuItem: menuItem[0], path});

        }catch (e) {
            logger.error('admin, controllers menuItemsController view');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./query only one item



    //.........................Edit menuItem...................................
    edit: async (req, res) => {

        try{
            const { id, name, price, choiceOf, shortDescription,
                description, menuId, image
            } = req.body;


            let imgName = image;


            if (req.files) {

                //Remove old image first
                if (image.trim()){ //Old image
                    fs.unlink(uploadDir + image, (err) => {
                        if (err) {
                            logger.error(err);
                        }
                    });
                }

                //Insert new image
                let newImage = req.files.newImage;
                imgName = name.toLowerCase().split(' ').join('')+moment().format() + image.mimetype.replace('image/', '.');

                newImage.mv(uploadDir + imgName, (err) => {
                    if (err) return res.status(400).send("Leider war der Upload nicht erfolgreich"); //Sorry, upload was not successful
                });
            }

            //Validate here

            const slug = slugify(
                `${name} ${moment().unix()}`,
                {lower: true}
            )

            //Edit in db

            await db('menuItems').where('id', id )
                .update({
                    menuId, name, price, shortDescription, image: imgName, description,
                    choiceOf, slug
                });


            return  res.status(200).end();


        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('Leider existiert dieser Name bereits'); //Sorry, this name already exists
            logger.error('admin, controllers menuItemsController edit');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },// ./Edit menu Item



    //.................Delete menuItems item........................
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

            await db('menuItems').where('id', id).del();

            return res.status(200).end();

        }catch (e) {
            logger.error('admin, controllers menuItemsController destroy');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./delete meni item


    //View Details
    viewDetails: async (req, res) => {
        try{
            const { id } = req.body;

            const menuItem = await db('menuItems')
                .select('name', 'price', 'shortDescription',
                    'image', 'description', 'choiceOf'
                )
                .where('id', id)
                .limit(1);

            const path = process.env.NODE_ENV !== 'production' ? `http://${req.headers.host}/images/menuItems/`
                : `https://${req.headers.host}/images/menuItems/`;

            if (menuItem[0] && menuItem[0].image.trim()) menuItem[0].image = path + menuItem[0].image;

            return res.status(200).send(menuItem[0]);

        }catch (e) {
            logger.error('admin, controllers menuItemsController viewDetails');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    } // ./view details


}


module.exports = menuItemsController;