const db = require("../config/db");

const AdminUser = async () => {
    if (!await db.schema.hasTable('adminusers')){

        await db.schema.createTable('adminusers', table => {
            table.bigIncrements('id').primary();
            table.string('name').notNullable();
            table.string('email').unique();
            table.tinyint('role').defaultTo(2);
            table.mediumint('specialCode').notNullable();
            table.string('password').notNullable(); //will use in JWT compare
            table.string('passwordResetCode', 10);
            table.boolean('isActive').defaultTo(true);
            table.timestamp('createdAt').defaultTo(db.fn.now());
            table.engine('InnoDB');
        });


        await db('adminUsers').insert(
            {
                name: "Innocent",
                email: "wsappiah@gmail.com",
                role: 1,
                specialCode: 202020,
                password: "$2a$10$Cr3fGxuNcFc0AhTuVvjDDOChtK77DBjH7wKtUhV5R5zgVRM.GqKK6",
                isActive: true,
                createdAt: new Date()
            }
        );
    }



}

module.exports = AdminUser;