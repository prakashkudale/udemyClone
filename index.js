const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Server is Started At Port : " + PORT);
});

const dbConnect = require("./config/database");
dbConnect();
