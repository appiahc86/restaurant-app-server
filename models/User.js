const db = require("../config/db");

const User = async () => {
    if (!await db.schema.hasTable('users')){

        await db.schema.createTable('users', table => {
            table.bigIncrements('id').primary();
            table.string('email').unique();
            table.string('password').notNullable();
            table.string('passwordResetCode', 10);
            table.mediumint('specialCode').notNullable(); //will use in JWT compare
            table.boolean('isActive').defaultTo(true);
            table.timestamp('createdAt').defaultTo(db.fn.now());
            table.engine('InnoDB');
        });


    }



}

module.exports = User;