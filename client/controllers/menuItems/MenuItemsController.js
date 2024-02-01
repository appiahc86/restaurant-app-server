const db = require("../../../config/db");
const logger = require("../../../winston");


const menuItemsController = {


    //.................Get all menuItems items............................
    index: async (req, res) => {
        try{

            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;

            if (req.query.searchTerm){
                const menuItems = await db('menuItems')
                    .join('menu', 'menuItems.menuId', '=','menu.id')
                    .select('menuItems.id', 'menuItems.name', 'menuItems.price',
                        'menuItems.image', 'menuItems.shortDescription',
                        'menuItems.description','menuItems.choiceOf',
                        'menu.id as menuId','menu.name as menu'
                    )
                    .where('menu.id', req.query.searchTerm)
                    .limit(pageSize)
                    .offset((page - 1) * pageSize);

                const total = await db('menuItems')
                    .join('menu', 'menuItems.menuId', '=','menu.id')
                    .where('menu.name', req.query.searchTerm)
                    .count('* as total')
                const path = process.env.NODE_ENV !== 'production' ? `http://${req.headers.host}/images/menuItems/`
                    : `https://${req.headers.host}/images/menuItems/`;


                return res.status(200).send({
                    menuItems,
                    path,
                    page,
                    // pageSize,
                    totalRecords: total[0].total
                });
            } // ./if req.query.searchTerm

            else{
                const menuItems = await db('menuItems')
                    .join('menu', 'menuItems.menuId', '=','menu.id')
                    .select('menuItems.id', 'menuItems.name', 'menuItems.price',
                        'menuItems.image', 'menuItems.shortDescription',
                        'menuItems.description','menuItems.choiceOf',
                        'menu.id as menuId','menu.name as menu'
                    )
                    .limit(pageSize)
                    .offset((page - 1) * pageSize);

                const total = await db('menuItems')
                    .count('* as total')
                const path = process.env.NODE_ENV !== 'production' ? `http://${req.headers.host}/images/menuItems/`
                    : `https://${req.headers.host}/images/menuItems/`;

                return res.status(200).send({
                    menuItems,
                    path,
                    page,
                    // pageSize,
                    totalRecords: total[0].total
                });
            } //./else


        }catch (e) {
            logger.error('admin, controllers menuItemsController index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get all menuItems items

}


module.exports = menuItemsController;