const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment");
const {generateReferenceNumber} = require("../../../functions");


const ordersController = {

    //Get orders
    index: async (req, res) => {
        try{

            const orders = await db("orders")
                .where("userId", req.user.id)
                .select("id", "orderDate", "total",
                    "deliveryStatus", "numberOfItems")
                .orderBy('id', 'desc')
                .limit(20);

            return res.status(200).send({orders});

        }catch (e) {
            logger.error('client, controllers ordersController index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // .get orders


    //Save order
    create: async (req, res) => {
        try{
            const {cart, deliveryAddress, deliveryFee, paymentMethod, note} = req.body;

            let total = parseFloat(deliveryFee);
            for (const cartElement of cart) {
                total += parseFloat(cartElement.price) * parseInt(cartElement.qty);
            }


            const orderDate = moment().format("YYYY-MM-DD HH:mm:ss");

            await db.transaction(async trx => {


                //save to orders Table
                const order = await trx('orders').insert({
                    userId: req.user.id,
                    orderDate,
                    total,
                    deliveryAddress,
                    deliveryFee,
                    numberOfItems: cart.length,
                    note
                })

                const orderDetailsArray = [];
                for (const crt of cart) {
                    orderDetailsArray.push({
                        orderId: order[0],
                        menuItemId: crt.id,
                        menuItemName: crt.name,
                        menuId: crt.menuId,
                        menuName: crt.menu,
                        qty: crt.qty,
                        price: crt.price,
                        choiceOf: crt.selectedChoice
                    })
                }

                //Save to orderDetails table
                await trx.batchInsert('orderDetails', orderDetailsArray, 30)


                //Insert into payments table
                const referenceNumber = generateReferenceNumber(moment()) + req.user.id;
                await trx('payments').insert({
                    reference: referenceNumber,
                    orderId: order[0],
                    paymentDate: orderDate,
                    paymentMethod,
                    amount: total,
                    status: 'successful'
                })


            })// ./Transaction

            return res.status(201).end();

        }catch (e) {
            logger.error('client, controllers ordersController create');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }, // .saveOrder


    //View Order details
    viewDetails: async (req, res) => {
        try{

            const orderId = req.query.id;
            const order = await db("orders")
                .join("orderDetails","orders.id","orderDetails.orderId")
                .select( "orders.orderDate", "orders.total","orders.deliveryAddress",
                    "orders.deliveryFee", "orders.deliveryStatus",
                    "orderDetails.qty", "orderDetails.price",
                    "orderDetails.menuItemName", "orderDetails.choiceOf")
                .where('orders.id', orderId)


            return res.status(200).send({order});

        }catch (e) {
            logger.error('client, controllers ordersController viewDetails');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }
}


module.exports = ordersController;