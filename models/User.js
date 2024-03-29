const db = require("../config/db");

const User = async () => {
    if (!await db.schema.hasTable('users')){

        await db.schema.createTable('users', table => {
            table.bigIncrements('id').primary();
            table.string('name');
            table.string('email').unique();
            table.string('verificationToken');
            table.boolean('isVerified').defaultTo(false);
            table.string('password').notNullable();
            table.string('passwordResetCode', 10);
            table.mediumint('specialCode').notNullable(); //will use in JWT compare
            table.jsonb('deliveryAddress').defaultTo('{}');
            table.boolean('isActive').defaultTo(true);
            table.timestamp('createdAt').defaultTo(db.fn.now());
            table.engine('InnoDB');
        });


        await db("users").insert({
            name: 'guest',
            email: "guest@guestemail.cco",
            password: "$2a$10$Cr3fGxuNcFc0AhTuVvjDDOChtK77DBjH7wKtUhV5R5zgVRM.GqKK9",
            isVerified: true,
            specialCode: 454332
        })


    }



}

module.exports = User;