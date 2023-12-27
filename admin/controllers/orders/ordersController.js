const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment");

const ordersController = {


    //Get today's orders
    index: async (req, res) => {
        try{

            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;
            

            const orderDate = moment().format("YYYY-MM-DD");

            const orders = await db("orders")
                .select("id", "orderDate", "total", "numberOfItems")
                .where("orderDate", ">=", orderDate)
                .where("deliveryStatus","waiting")
                .limit(pageSize)
                .offset((page - 1) * pageSize);

            const total = await db('orders')
                .where("orderDate", ">=", orderDate)
                .where("deliveryStatus","waiting")
                .count('* as total')

            return res.status(200).send({
                orders,
                page,
                // pageSize,
                totalRecords: total[0].total
            });

        }catch (e) {
            logger.error('admin, controllers ordersController index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get all Orders


    //View order
    details: async (req, res) => {
        try {
            const id = req.body.id;

            const order = await db("orders")
                .join("orderDetails", "orders.id", "=", "orderDetails.orderId")
                .select( "orders.orderDate", "orders.total", "orders.deliveryAddress",
                    "orders.deliveryFee", "orders.note", "orders.deliveryStatus",
                    "orderDetails.id as orderDetailsId","orderDetails.menuItemName",
                    "orderDetails.qty", "orderDetails.price", "orderDetails.choiceOf")
                .where("orders.id", id);

             order.map((ord) => {
                ord.deliveryAddress = JSON.parse(ord.deliveryAddress);
            })

            return res.status(200).send(order);

        }catch (e) {
            logger.error('admin, controllers ordersController details');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },

    //Send order
    sendOrder: async (req, res) => {
        try {
            const id = req.body.id;

                 await db("orders")
                .where("orders.id", id)
                .update({deliveryStatus: "delivering"});


            return res.status(200).end();

        }catch (e) {
            logger.error('admin, controllers ordersController sendOrder');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },


    //cancel order
    cancelOrder: async (req, res) => {
        try {
            const id = req.body.id;

            await db("orders")
                .where("orders.id", id)
                .update({deliveryStatus: "canceled"});

            return res.status(200).end();

        }catch (e) {
            logger.error('admin, controllers ordersController cancelOrder');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./cancel order

    //Get delivering orders
    delivering: async (req, res) => {
        try{

            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;

            const orderDate = moment().format("YYYY-MM-DD");

            const orders = await db("orders")
                .select("id", "orderDate", "total", "numberOfItems")
                .where("orderDate", ">=", orderDate)
                .where("deliveryStatus","delivering")
                .limit(pageSize)
                .offset((page - 1) * pageSize);

            const total = await db('orders')
                .where("orderDate", ">=", orderDate)
                .where("deliveryStatus","delivering")
                .count('* as total')

            return res.status(200).send({
                orders,
                page,
                // pageSize,
                totalRecords: total[0].total
            });

        }catch (e) {
            logger.error('admin, controllers ordersController index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // ./get delivering orders



    //Mark as delivered
    delivered: async (req, res) => {
        try {
            const id = req.body.id;

            await db("orders")
                .where("orders.id", id)
                .update({deliveryStatus: "delivered"});


            return res.status(200).end();

        }catch (e) {
            logger.error('admin, controllers ordersController delivered');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },


}


module.exports = ordersController;