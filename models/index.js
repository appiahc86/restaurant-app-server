const User = require("./User");
const AdminUser = require("./AdminUser");
const Menu = require("./Menu");
const MenuItem = require("./MenuItem");
const Order = require("./Order");
const OrderDetails = require("./OrderDetail");
const Payment = require("./Payment");
const Setting = require("./Setting");
const ZipCodes = require("./ZipCodes");




const migrations =  [
    User, AdminUser, Menu, MenuItem,
    Order, OrderDetails, Payment, Setting, ZipCodes
]

  const runMigrations = async () => {

    for (const migration of migrations) {
        await migration();
    }

      if (process.env.NODE_ENV !== 'production') console.log('Database Connected');

  }

 module.exports = runMigrations;