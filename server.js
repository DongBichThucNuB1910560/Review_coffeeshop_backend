require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const passport = require("passport");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5500;

// app.use(bodyParser.urlencoded({
//   extended: false
// }));
// app.use(bodyParser.json());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));
app.use(passport.initialize());
require('./config/passport')(passport);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to the database!"))
  .catch((error) => console.log(error));

app.use("/api/post", productRoutes);

app.use("/api/users", userRoutes);

app.listen(port, () => console.log(`Server is running on port ${port}.`));
