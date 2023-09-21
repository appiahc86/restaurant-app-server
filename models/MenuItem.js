const db = require("../config/db");

const MenuItem = async () => {
    if (!await db.schema.hasTable('menuItems')){

        await db.schema.createTable('menuItems', table => {
            table.bigIncrements('id').primary();
            table.bigInteger('menuId').unsigned().notNullable().index();
            table.string('name').notNullable().index();
            table.float('price').notNullable();
            table.string('shortDescription');
            table.string('image');
            table.text('description');
            table.jsonb('choiceOf').defaultTo("[]");
            table.string('slug').notNullable().unique().index();
            table.timestamp('createdAt');
            table.engine('InnoDB');

            table.foreign('menuId').references('id').inTable('menu').onDelete('CASCADE');

        });
    }


}

module.exports = MenuItem;