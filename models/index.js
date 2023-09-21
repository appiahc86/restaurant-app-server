const User = require("./User");
const AdminUser = require("./AdminUser");
const Menu = require("./Menu");
const MenuItem = require("./MenuItem");
const Order = require("./Order");
const OrderDetails = require("./OrderDetail");
const Payment = require("./Payment");




const migrations =  [
    User, AdminUser, Menu, MenuItem,
    Order, OrderDetails, Payment
]

  const runMigrations = async () => {

    for (const migration of migrations) {
        await migration();
    }

      console.log('Database Connected')
  }

 module.exports = runMigrations;