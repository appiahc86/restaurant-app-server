const express = require("express");
const router = express.Router();

const dashboardUsers = require("../../../admin/controllers/users/index");
const auth = require("../../middleware/auth");

//Get dashboard users
router.get("/", auth, dashboardUsers.index);

//Add user
router.post("/", auth, dashboardUsers.create);

//Fetch user
router.post("/view", auth, dashboardUsers.view);

//Edit user
router.post("/edit", auth, dashboardUsers.edit);

module.exports = router;