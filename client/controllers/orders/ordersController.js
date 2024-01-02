const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment");
const {generateReferenceNumber} = require("../../../functions");
const { createOrder, captureOrder } = require("../../../functions/payPalFunction");
const { calculateOrder } = require("../../../functions/calculateOrder");
const {sendOrderEmail} = require("../../../functions/orderEmail");



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

            //Check if orders are allowed
            const settingsQuery = await db("settings")
                .where("id", 1)
                .select("appConfig");

            const result = JSON.parse(settingsQuery[0].appConfig);
            if (!result.allowOrders) return res.status(400)
                .json("Bestellungen sind derzeit leider nicht möglich. Bitte versuchen Sie es später noch einmal.");



            const {cart, deliveryAddress, paymentMethod, note} = req.body;


            const processedData = await calculateOrder(cart, deliveryAddress, paymentMethod, note);
           if (processedData.error){
               return res.status(400).json(processedData.error);
           }


            const orderDate = moment().format("YYYY-MM-DD HH:mm:ss");

            // ******************** If payPal payment **************
            if (paymentMethod === "paypal"){
                const { jsonResponse, httpStatusCode } = await createOrder(processedData.total);
                return res.status(httpStatusCode).json(jsonResponse);
            }


            // ************** If Cash Payment **********************
            if (paymentMethod === "cash"){

                let total = processedData.total;
                let orderId;

                await db.transaction(async trx => {

                    const order = await trx('orders').insert({
                        userId: req.user.id,
                        orderDate,
                        total: processedData.total,
                        deliveryAddress: processedData.deliveryAddress,
                        deliveryFee: processedData.deliveryFee,
                        numberOfItems: processedData.cart.length,
                        note: processedData.note
                    })

                    orderId = order[0];

                    const orderDetailsArray = [];
                    for (const crt of processedData.cart) {
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
                        extReference: referenceNumber,
                        orderId: order[0],
                        paymentDate: orderDate,
                        paymentMethod: 'cash',
                        amount: total,
                        status: "successful"
                    })


                })// ./Transaction

                 res.status(201).end();

                await sendOrderEmail(
                    req.user.email,
                    {
                        cart: processedData.cart,
                        deliveryFee: processedData.deliveryFee,
                        deliveryAddress: processedData.deliveryAddress,
                        total: processedData.total,
                        orderId,
                        note: processedData.note
                    }
                    );


            }


            // ************************ if Credit Card Payment ************************************
            if (paymentMethod === "cc"){

                //Calculate cart total
                let total = processedData.total;

                await db.transaction(async trx => {

                    const order = await trx('orders').insert({
                        userId: req.user.id,
                        orderDate,
                        total,
                        deliveryAddress: processedData.deliveryAddress,
                        deliveryFee: processedData.deliveryFee,
                        numberOfItems: processedData.cart.length,
                        note: processedData.note
                    })

                    const orderDetailsArray = [];
                    for (const crt of processedData.cart) {
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
                        extReference: req.body.extReference,
                        orderId: order[0],
                        paymentDate: orderDate,
                        paymentMethod: 'cc',
                        amount: total,
                    })


                })// ./Transaction


                return res.status(201).end();
            }


        }catch (e) {
            logger.error('client, controllers ordersController create');
            logger.error(e);
            return res.status(400).json("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
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

            if (order.length){
                order[0].deliveryAddress = JSON.parse(order[0].deliveryAddress)
            }

            return res.status(200).send({order});

        }catch (e) {
            logger.error('client, controllers ordersController viewDetails');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },


    //Capture
    capture: async (req, res) => {
        try {

            const { orderID } = req.params;

            const {cart, deliveryAddress, note} = req.body;


            const processedData = await calculateOrder(cart, deliveryAddress, "paypal", note);
            if (processedData.error){
                return res.status(400).json(processedData.error);
            }


            const orderDate = moment().format("YYYY-MM-DD HH:mm:ss");

            //Calculate cart total
            let total = processedData.total;

            const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

            // save order to database
            if (httpStatusCode === 201 || httpStatusCode === 200) {

                await db.transaction(async trx => {

                    const order = await trx('orders').insert({
                        userId: req.user.id,
                        orderDate,
                        total,
                        deliveryAddress: processedData.deliveryAddress,
                        deliveryFee: processedData.deliveryFee,
                        numberOfItems: processedData.cart.length,
                        note: processedData.note
                    })

                    const orderDetailsArray = [];
                    for (const crt of processedData.cart) {
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
                        extReference: orderID,
                        orderId: order[0],
                        paymentDate: orderDate,
                        paymentMethod: 'paypal',
                        amount: total
                    })

                })// ./Transaction
            }

            //If Payment is successful
            if (jsonResponse.status === "COMPLETED"){
                await db("payments")
                    .where("extReference", orderID)
                    .andWhere("paymentMethod", "paypal")
                    .update({status: "successful"})
            }

            res.status(httpStatusCode).json(jsonResponse);
        } catch (e) {
            logger.error('client, controllers ordersController capture');
            logger.error(e);
            return res.status(400).json({error: "Leider war Ihre Anfrage nicht erfolgreich"});

        }
    },

    //Delete order
    destroy: async (req, res) => {
        try{

            const payment = await db("payments").where('extReference', req.body.extReference)
                .andWhere('paymentMethod', 'cc').select('orderId').limit(1);

            await db("orders").where('id', payment[0].orderId).del();

            return res.status(200).end();

        }catch (e) {
            logger.error('client, controllers ordersController Destroy');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    }


}


module.exports = ordersController;