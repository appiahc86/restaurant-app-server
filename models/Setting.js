const db = require("../config/db");

const Setting = async () => {
    if (!await db.schema.hasTable('settings')){

        await db.schema.createTable('settings', table => {
            table.bigIncrements('id').primary();
            table.jsonb('appConfig');
            table.engine('InnoDB');
        });

        await db("settings").insert({
            appConfig: JSON.stringify({
                allowOrders: true,
            })
        })

    }



}

module.exports = Setting;