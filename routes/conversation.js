const express = require("express");

const { authUser } = require("../middlwares/auth");
const { getCoversation } = require("../controllers/conversation");

const router = express.Router();

router.get("/receivers/:receiver_id", authUser, getCoversation);


module.exports = router;
