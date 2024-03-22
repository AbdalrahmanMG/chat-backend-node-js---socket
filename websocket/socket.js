const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const { sendingMessage } = require("../controllers/message.controller.js");

const app = express();
const httpServer = createServer(app);


const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  console.log("a new user connected", socket.id);

  //this code to tell everyone who is online (we don't need it now)
  // socket.on("JoinChat", (data)=>{
  //   addChat(chatId, socket.id)
  //   io.emit('getChat', chats)
  // })

  //this code to send message
  socket.on("sendMessage", (data) => {
    console.log("this is hamada");
    const { chatId, recieverId, message, userId } = data;
    sendingMessage(io, {socket, ...data});
    console.log({...data});
  });


  socket.on("disconnect", () => {
    console.log("userleaving");
    // io.emit('getChats', chats)
  });
});

module.exports = { app, io, httpServer };
