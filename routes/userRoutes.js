const express = require("express");
const router = express.Router();
const API = require("../controllers/api");
const multer = require("multer");

const passport = require('passport');

router.post("/register", API.userRegister);
router.post("/login", API.userLogin);

// router.get('/profile',protect,API.fetchUser);
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.json({
      user: req.user,
    });
  }
);

module.exports = router;
