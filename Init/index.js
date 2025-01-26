const mongoose = require("mongoose");
const initdata = require("./data");
const Listing = require("../Model/ListingModel");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Air");
}
const dataInsert = async function () {
  await Listing.deleteMany({});
  initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: "678f8390ca7230f3a3f08485",
  }));
  await Listing.insertMany(initdata.data);
  // console.log("Data Inserted");
};
dataInsert();
