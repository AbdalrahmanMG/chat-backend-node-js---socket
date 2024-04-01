const { createServer } = require("http");
// const { Server } = require("socket.io");
const express = require("express");
const { sendMessage } = require("../controllers/message.controller");

const app = express();
const httpServer = createServer(app);
const io = require('socket.io')(httpServer)

io.on('connection', (socket)=>{
    console.log("a new user connected");

    socket.on('sendMessage', (data) => {
        const {chatId, recieverId, message, senderId} = data;
        sendMessage(data)
      });

      socket.on('disconnect', () => {
        console.log('user disconnected');
      });

})


module.exports = { app, io, httpServer };
