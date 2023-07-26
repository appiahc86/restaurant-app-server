const User = require("./User");
const AdminUser = require("./AdminUser");




const migrations =  [
    User, AdminUser
]

  const runMigrations = async () => {

    for (const migration of migrations) {
        await migration();
    }

      console.log('Database Connected')
  }

 module.exports = runMigrations;