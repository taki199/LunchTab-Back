const express = require('express')
const connectToDb = require('./config/connectToDb');
const cors = require("cors");
require("dotenv").config();
const cookieParser = require('cookie-parser');
const activityMiddleware = require('./middlewares/activityMiddleware');



//connect to DB
connectToDb();

// init app 
const app = express()

//Middlewares

app.use(express.json());
app.use(cookieParser());
app.use(activityMiddleware);


//Cors Policy
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Allow credentials (cookies)
}));

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