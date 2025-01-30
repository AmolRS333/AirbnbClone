const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const listingsRoute = require("./routes/listing");
const reviewsRoute = require("./routes/review");
const UserRoute = require("./routes/user");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Model/user");
const dbURL = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dbURL,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SECRET,
  },
});
store.on("error", function (e) {
  console.log("Session Store Error", e);
});

const sessionConfig = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

//Atlas mongodb url for cloud storage...

main().catch((err) => console.log(err));
async function main() {
  mongoose.connect(dbURL, {
    tls: true,
  });
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.use(flash());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.get("/demouser", async (req, res) => {
  const fakeUser = new User({ email: "abc@gmil.com", username: "abc" });
  let registeredUser = await User.register(fakeUser, "123");
  res.send(registeredUser);
});

app.use("/listings", listingsRoute);
app.use("/listings/:id/reviews", reviewsRoute);
app.use("/", UserRoute);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { message });
  // res.status(statusCode).send(message);
});

app.listen(port, () => {
  console.log("Server is running on port 3000");
});
