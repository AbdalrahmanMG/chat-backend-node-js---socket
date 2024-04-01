const mongoose = require('mongoose')
require('dotenv').config()

const DB_URL = process.env.DB_URL

const connectToDb = async () =>{
    try {
        await mongoose.connect(DB_URL)
        console.log("connecting to mongoDB");
    } catch (error) {
        console.log('Error connecting to db', error);
    }
}

module.exports = connectToDb