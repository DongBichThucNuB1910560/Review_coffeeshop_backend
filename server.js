require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const routes = require("./routes/routes");

const app = express();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("uploads"));

mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true
}).then(()=>console.log("Connected to the database!"))
.catch((error)=>console.log(error));

app.use('/api/post',routes)

app.listen(port,()=>console.log(`Server is running on port ${port}.`))