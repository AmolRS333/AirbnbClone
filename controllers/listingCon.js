const Listing = require("../Model/ListingModel");

module.exports.home = async (req, res) => {
  let data = await Listing.find();
  res.render("Home.ejs", { data });
};

module.exports.renderNewForm = (req, res) => {
  res.render("new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let ID = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!ID) {
    req.flash("error", "Cannot find that Listing!!!");
    return res.redirect("/listings");
  }
  res.render("Show", { ID });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "Successfully Created a new Listing!!!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let ID = await Listing.findById(id);
  if (!ID) {
    req.flash("error", "Cannot find that Listing!!!");
    return res.redirect("/listings");
  }
  let originalImageUrl = ID.image.url;
  originalImageUrl = originalImageUrl.replace("upload", "upload/w_250");
  res.render("edit", { ID, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.paramsth;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Successfully Updated a Listing!!!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Deleted a Listing!!!");
  res.redirect("/listings");
};
