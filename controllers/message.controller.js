const Chat = require("../models/chat.model.js");
const Message = require("../models/message.model.js");
const { User } = require("../models/user.model.js");
// const { io } = require("../websocket/newsocket.js");

//sending message if there is a chat or creating chat
const sendingMessage = async (io, socket, data) => {
  try {
    console.log('sending message');
    let { message, chatId, recieverId, userId } = data;
    const LoggedUser = userId;

    // find chat by id if frontend sends one
    let chat = await Chat.findOne({ _id: chatId });
    console.log('🛺🛺🛺,', data);

    // no chat id so no chat 
    if (!chat) {
      console.log('no chat found');

      // finding chat by participants if it is private chat
      chat = await Chat.findOne({
        participants: { $all: [LoggedUser, recieverId], $size: 2 },
        isGroup: false,
      });
      // console.log(chat);

      // there is no chat at all so let's create one
      if (!chat) {
        console.log('no private chat found',);
        let reciever = await User.findById(recieverId);
        chat = await Chat.create({
          participants: [LoggedUser, recieverId],
          chatName: reciever.fullName,
          chatPic: reciever.profilePic,
        })
      }
      chatId = chat._id.toString()
      // console.log("created chat 🚃🚞", chat);
    }

    let sender = await User.findById(LoggedUser);

    const newMessage = new Message({
      senderId: sender,
      recieverId,
      message,
      chatId,
    });

    // if (newMessage) {
    //   chat.messages.push(newMessage.id);
    // }


    await chat.save();
    await newMessage.save();

    console.log("🎈", chatId, newMessage);
    socket.join(chatId);
    io.to(chatId).emit("sendMessage", newMessage);

    return newMessage;
    // res.status(200).json(newMessage);
  } catch (error) {
    console.log(error);
    // return res.status(500).json({ success: false, message: error.message });
  }
};

//get messages
const getMessage = async (req, res) => {
  try {
    const { recieverId, chatId } = req.body;
    const LoggedUser = req.user.id;

    let chat = await Chat.findOne({ _id: chatId });

    if (!chat) {
      chat = await Chat.findOne({
        participants: { $all: [LoggedUser, recieverId], $size: 2 },
        isGroup: false,
      })
    }

    if (!chat) {
      return res.status(200).json([]);
    }

    const userInChat = chat.participants.find(
      (participant) => participant._id == LoggedUser
    );

    if (!userInChat) {
      return res
        .status(403)
        .json({ error: "You are not authorized to access this chat" });
    }


    const messages = await Message.find({ chatId })
      .populate('senderId', '_id profilePic fullName');

    res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// let messages = await Message.find(chatId = chat._id)
// console.log("messages", messages);

//update a message
const updateMessage = async (req, res) => {
  try {
    let { messageId, message } = req.body;
    const LoggedUser = req.user.id;

    let editedMessage = await Message.findOne({ _id: messageId });

    if (editedMessage.senderId != LoggedUser) {
      return res.status(403).json({ message: "user is not the sender!" });
    }

    let currentTime = new Date();
    let createdAt = editedMessage.createdAt;
    let timeDifferance = currentTime - createdAt;
    let timeInMinutes = timeDifferance / (1000 * 60);

    if (timeInMinutes > 15) {
      return res.status(400).json({
        success: false,
        message: "you have exceeded the limited time 15min!",
      });
    }

    editedMessage.message = message;

    await editedMessage.save();

    return res.status(201).json(editedMessage);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//delete a message
const deleteMessage = async (req, res) => {
  try {
    let { messageId } = req.body;
    const LoggedUser = req.user.id;

    let messesToDelete = await Message.findOne({ _id: messageId });

    if (messesToDelete.senderId != LoggedUser) {
      return res.status(403).json({ message: "user is not the sender!" });
    }

    let currentTime = new Date();
    let createdAt = messesToDelete.createdAt;
    let timeDifferance = currentTime - createdAt;
    let timeInMinutes = timeDifferance / (1000 * 60);

    if (timeInMinutes > 15) {
      return res.status(400).json({
        success: false,
        message: "you have exceeded the limited time 15min!",
      });
    }

    await Message.deleteOne({ _id: messageId });
    // await Chat.updateOne(
    //   { _id: messesToDelete.chatId },
    //   { $pull: { messages: messageId } }
    // );

    return res
      .status(201)
      .json({ success: true, message: "Message deleted succefully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { sendingMessage, getMessage, updateMessage, deleteMessage };