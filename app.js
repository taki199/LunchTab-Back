const express = require('express')
const connectToDb = require('./config/connectToDb');
const cors = require("cors");
require("dotenv").config();

//connect to DB
connectToDb();

// init app 
const app = express()

//Middlewares

app.use(express.json());

//Cors Policy
app.use(cors({
    origin:"http://localhost:3000"
}))

//routes
 app.use("/api/orders",require("./routes/orderRoute"));
 app.use("/api/auth",require("./routes/authRoute"))
 app.use("/api/users",require("./routes/usersRoute"));
 app.use("/api/customers",require("./routes/customersRout"));
 
// app.use("/api/posts",require("./routes/postsRoute"));
// app.use("/api/comments",require( "./routes/commentsRoute"));
app.use("/api/categories",require( './routes/categoryRoute'));
app.use("/api/dishes",require( './routes/dishRoute'));


const Port = process.env.PORT || 5000

app.listen(Port, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on port ${Port}`)
})