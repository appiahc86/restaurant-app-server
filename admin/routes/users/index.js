const express = require("express");
const router = express.Router();

const dashboardUsers = require("../../../admin/controllers/users/index");
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");

//Get dashboard users
router.get("/", auth, isAdmin, dashboardUsers.index);

//Add user
router.post("/", auth, isAdmin, dashboardUsers.create);

//Fetch user
router.post("/view", auth, isAdmin, dashboardUsers.view);

//Edit user
router.post("/edit", auth, isAdmin, dashboardUsers.edit);

module.exports = router;