
const express = require("express");
const path = require("path");
const fastcsv = require("fast-csv");
const fs = require("fs");
const url = require("url");
const mysql = require("mysql");


const dotenv = require("dotenv");
dotenv.config();

const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.static(path.join(__dirname, "build")));

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 500000000,
  })
);
app.use(express.json({ limit: "50mb" }));


// connect to the db
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "host",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: "db",
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/version", function (req, res) {
  res.send("Version 2.0");
});

// endpoint to verify if the wallet address is whitelist or not
app.get("/verify", function (req, res) {
  let status = false;
  //res.send(true);
  const queryObj = url.parse(req.url,true).query
  console.log(`Verifying wallet ${queryObj.walletAddress}`);
  let sqlQuery = `SELECT * FROM whitelist WHERE wallet_address="${queryObj.walletAddress}"`
  connection.query(sqlQuery, (err, rows) => {
    if(err) throw err
    if(rows && rows.length > 0) {
      console.log(rows);
      if( rows[0].wallet_address) {
  console.log("verified, allowed to mint");
        status = true;
        //res.send(true)
      } else {

  console.log("reached max minting limit, not allowed to mint");
      status = false;      
      //res.send(false)
      }
    } else {
      console.log("not whitelisted - not allowed to mint");
      status = false;      
      //res.send(false)
    }
    return res.send(status);
  }) 
  
});


app.listen(9000);