// package Imports
const express = require("express");
const dotenv = require("dotenv");
const cookieParser  = require('cookie-parser')
const cors = require('cors')

// file imports
const userRoutes = require("./routes/user.routes.js");
const messageRoutes = require("./routes/message.routes.js");
const contactsRoutes = require("./routes/contacts.routes.js");
const connectToDb = require("./db/connectToDB.js");
const {app, httpServer} = require('./websocket/socket.js')

// variables
// const app = express();
const port = process.env.PORT;

dotenv.config();

// middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors()) 


//routes
app.use("/user", userRoutes);
app.use("/message", messageRoutes);
app.use("/contacts", contactsRoutes);

httpServer.listen(port, () => {
  connectToDb();
  console.log(`Server is running on port ${port}`);
});
