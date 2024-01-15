const db = require("../../config/db");
const logger = require("../../winston");
const moment = require("moment");

const dashboardController = {
    index: async (req, res) => {
        try{
            const today = moment().format("YYYY-MM-DD");

            await db.transaction( async trx => {


                //Get number of users
                const users = await trx("users")
                    .count("id as total");

                //Get total menu Items
                const menuItems = await trx("menuItems")
                    .count("id as total");


                //Get today's orders
                const orders = await trx("orders")
                    .join("payments","orders.id", "=","payments.orderId")
                    .sum("payments.amount as totalOrders")
                    .where("payments.paymentDate", ">=", today)
                    .where("payments.status", "successful")

                //Barchart Records
                let barChartRecords = await trx('orderDetails')
                    .innerJoin('menu', 'orderDetails.menuId', 'menu.id')
                    .innerJoin('orders', 'orders.id', 'orderDetails.orderId')
                    .innerJoin("payments", "orders.id", "=", "payments.orderId")
                    .select('menu.name')
                    .sum('orderDetails.qty as sum')
                    .whereRaw('orders.orderDate >= ?', [today])
                    .whereRaw('payments.status = ?', ["successful"])
                    .groupBy('menu.id')
                    .orderBy('sum', 'desc')
                    .limit(10);

                barChartRecords =  barChartRecords.filter(item => item.sum > 0)


                return res.status(200).send({
                    users: users[0].total,
                    totalMenuItems: menuItems[0].total || 0,
                    todayOrders: orders[0].totalOrders || 0,
                    barChartRecords
                });

            })


        }catch (e) {
            logger.error('admin, controllers dashboardController index');
            logger.error(e);
            return res.status(400).send("Leider war Ihre Anfrage nicht erfolgreich"); //Sorry your request was not successful
        }
    },
}


module.exports = dashboardController;