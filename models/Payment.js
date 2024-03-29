const db = require("../config/db");

const Payment = async () => {
    if (!await db.schema.hasTable('payments')){

        await db.schema.createTable('payments', table => {
            table.bigIncrements('id').primary();
            table.string('extReference').unique().index();
            table.bigInteger('orderId').unsigned().notNullable();
            table.datetime('paymentDate').index();
            table.string('paymentMethod').index();
            table.decimal('amount');
            table.enum('status', ['successful', 'pending', 'refunding', 'failed', 'refund']).defaultTo('pending').index();
            table.engine('InnoDB');

            table.foreign('orderId').references('id').inTable('orders').onDelete('cascade')
        });


    }


}

module.exports = Payment;