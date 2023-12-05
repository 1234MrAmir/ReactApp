const mongoose = require("mongoose");
const express = require("express");
const app = express();

const connectmongo = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/myapp")
    .then((success) => app.listen())
    .catch((err) => console.log(err.message));
  console.log("connected to  mongo  DataBase successfully");
};
module.exports = connectmongo;
