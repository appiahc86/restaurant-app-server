const db = require("../config/db");

const Delivery = async () => {
    if (!await db.schema.hasTable('deliveries')){

        await db.schema.createTable('deliveries', table => {
            table.bigIncrements('id').primary();
            table.bigInteger('userId').unsigned().notNullable();
            table.bigInteger('orderId').unsigned().notNullable();
            table.timestamp('createdAt').defaultTo(db.fn.now());

            table.engine('InnoDB');

            table.foreign('userId').references('id').inTable('adminusers').onDelete('cascade');
            table.foreign('orderId').references('id').inTable('orders').onDelete('cascade');
        });

    }


}

module.exports = Delivery;