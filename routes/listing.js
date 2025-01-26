if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const listingConstroller = require("../controllers/listingCon");
const Listing = require("../Model/ListingModel");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudConfig");
const { storage } = require("../cloudConfig");

const multer = require("multer");
const upload = multer({ storage });

// Index Route &create route
router
  .route("/")
  .get(wrapAsync(listingConstroller.home))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingConstroller.createListing)
  );

// new Route
router.get("/new", isLoggedIn, listingConstroller.renderNewForm);

// show route & update route & delete route
router
  .route("/:id")
  .get(wrapAsync(listingConstroller.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingConstroller.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingConstroller.destroyListing));

// Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingConstroller.renderEditForm)
);

module.exports = router;
