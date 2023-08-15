const User = require("./User");
const AdminUser = require("./AdminUser");
const Menu = require("./Menu");
const MenuItem = require("./MenuItem");




const migrations =  [
    User, AdminUser, Menu, MenuItem
]

  const runMigrations = async () => {

    for (const migration of migrations) {
        await migration();
    }

      console.log('Database Connected')
  }

 module.exports = runMigrations;