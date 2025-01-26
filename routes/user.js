const express = require("express");
const router = express.Router();
const User = require("../Model/user");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/usersCon");

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router
  .route("/signup")
  .get(userController.signup)
  .post(wrapAsync(userController.postSignup));

router
  .route("/login")
  .get(userController.login)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.postLogin
  );

router.get("/logout", userController.logout);

module.exports = router;
