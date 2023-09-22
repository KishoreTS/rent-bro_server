//jshint esversion:6
require("dotenv").config();
const express = require("express");
// const http = require("http");
const bodyParser = require("body-parser");
// const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const hash = require("js-sha512");
const shortid = require("shortid");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ------------------------configuration of cors----------------------
var corsOptions = {
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
};

//--------------configuration for the mongoose model for the database------------------
mongoose.connect(process.env.MONGODB_URL);

//schema for the user
const usersSchema = {
  _id: String,
  email: String,
  password: String,
  name: String,
};

const User = mongoose.model("User", usersSchema);

//route for the user login website
app.options("/login", cors());
app.post("/login", function (req, res) {
  User.findOne({ email: req.body.Email }, function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      if (docs === null) {
        res.send("You have not registered with us! Signup to continue.");
      } else {
        if (docs.password === hash(req.body.Password)) {
          res.send({ status: "success", message: docs });
        } else {
          res.send({
            status: "failed",
            message: "Incorrect Email or Password",
          });
        }
      }
    }
  });
});

//routes for the user signup from website
app.options("/signupUser", cors());
app.post("/signupUser", function (req, res) {
  const newUser = {
    _id: "UID_" + shortid.generate(),
    email: req.body.Email,
    password: hash("" + req.body.Password),
    name: req.body.Name,
  };
  const dataPromiseChain = new Promise(function (resolve, reject) {
    let flag = "false";
    //checking the user already exist or not
    User.findOne({ email: req.body.Email }, function (err, docs) {
      if (err) {
        res.send({ status: "failed" });
        flag = "false";
      } else {
        if (docs === null) {
          flag = "true";
        } else {
          res.send({ status: "failed", message: "UserExist | Please Login.." });
          flag = "false";
        }
      }
      resolve(flag);
    });
  })
    .then(function (payload) {
      if (payload === "true") {
        User.create(newUser, function (err, result) {
          if (err) {
            res.send({ status: "failed" });
          } else {
            res.send({
              status: "success",
              message: result,
            });
          }
        });
      } //end of if statement
    })
    .catch(function (err) {
      //  console.log("error at user login chains ");
    });
});

//app listening port number
app.listen(process.env.PORT || 3001, function () {
  console.log("Server started on port 3001");
});
