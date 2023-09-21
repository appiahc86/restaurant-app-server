const db = require("../config/db");

const Menu = async () => {
    if (!await db.schema.hasTable('menu')){

        await db.schema.createTable('menu', table => {
            table.bigIncrements('id').primary();
            table.string('name').unique();
            table.string('image');
            table.string('slug').notNullable().unique().index();
            table.timestamp('createdAt').defaultTo(db.fn.now());
            table.engine('InnoDB');
        });

    }



}

module.exports = Menu;