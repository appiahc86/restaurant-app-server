const db = require("../config/db");

const OrderDetail = async () => {
    if (!await db.schema.hasTable('orderDetails')){

        await db.schema.createTable('orderDetails', table => {
            table.bigIncrements('id').primary();
            table.bigInteger('orderId').unsigned().notNullable();
            table.bigInteger('menuItemId').unsigned();
            table.string('menuItemName');
            table.bigInteger('menuId').unsigned().index();
            table.string('menuName');
            table.integer('qty');
            table.decimal('price');
            table.string('choiceOf');
            table.engine('InnoDB');

            table.foreign('orderId').references('id').inTable('orders').onDelete('cascade');
        });

    }



}

module.exports = OrderDetail;