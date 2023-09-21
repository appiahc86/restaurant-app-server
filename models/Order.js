const db = require("../config/db");

const Order = async () => {
    if (!await db.schema.hasTable('orders')){

        await db.schema.createTable('orders', table => {
            table.bigIncrements('id').primary();
            table.bigInteger('userId').unsigned().notNullable();
            table.datetime('orderDate').index();
            table.decimal('total');
            table.jsonb('deliveryAddress').defaultTo('{}');
            table.float('deliveryFee');
            table.enum('deliveryStatus',['delivered','waiting', 'delivering', 'canceled']).defaultTo('waiting').index();
            table.smallint('numberOfItems');
            table.string('note');
            table.engine('InnoDB');

            table.foreign('userId').references('id').inTable('users').onDelete('cascade')
        });

    }



}

module.exports = Order;