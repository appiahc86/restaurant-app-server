const db = require("../config/db");

const ZipCodes = async () => {
    if (!await db.schema.hasTable('zipCodes')){

        await db.schema.createTable('zipCodes', table => {
            table.bigIncrements('id').primary();
            table.string('zipCode').notNullable().unique().index();
            table.string('town');
            table.float('minOrder').defaultTo(0);
            table.float('deliveryFee').defaultTo(0);
            table.engine('InnoDB');
        });

    }



}

module.exports = ZipCodes;