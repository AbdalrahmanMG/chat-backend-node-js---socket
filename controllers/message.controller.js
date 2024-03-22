const Chat = require("../models/chat.model.js");
const Massage = require("../models/message.model.js");
const { User } = require("../models/user.model.js");
// const { io } = require("../websocket/newsocket.js");

//sending message if there is a chat or creating chat
const sendingMessage = async (io, data) => {
  try {
    const { message, chatId, recieverId, userId, socket } = data;
    const LoggedUser = userId;

    let chat = await Chat.findOne({ _id: chatId });

    if (!chat) {
      let reciever = await User.findById(recieverId);
      chat = await Chat.create({
        participants: [LoggedUser, recieverId],
        chatName: reciever.fullName,
        chatPic: reciever.profilePic,
      });
    }

    let sender = await User.findById(LoggedUser);

    const newMessage = new Massage({
      senderId: LoggedUser,
      recieverId,
      message,
      chatId: chat._id,
      senderImage: sender.profilePic,
      senderName: sender.fullName,
    });

    if (newMessage) {
      chat.messages.push(newMessage.id);
    }

    await chat.save();
    await newMessage.save();

    socket.join(chatId ? chatId : chat._id);
    console.log("🎈", chatId);
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

    let chat = await Chat.findOne({ _id: chatId }).populate("messages");

    if (!chat) {
      chat = await Chat.findOne({
        participants: { $all: [LoggedUser, recieverId], $size: 2 },
        isGroup: false,
      }).populate("messages");
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

    res.status(200).json(chat.messages);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateMessage = async (req, res) => {
  try {
    let { messageId, message } = req.body;
    const LoggedUser = req.user.id;

    let editedMessage = await Massage.findOne({ _id: messageId });

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

const deleteMessage = async (req, res) => {
  try {
    let { messageId } = req.body;
    const LoggedUser = req.user.id;

    let messesToDelete = await Massage.findOne({ _id: messageId });

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

    await Massage.deleteOne({ _id: messageId });
    await Chat.updateOne(
      { _id: messesToDelete.chatId },
      { $pull: { messages: messageId } }
    );

    return res
      .status(201)
      .json({ success: true, message: "Message deleted succefully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { sendingMessage, getMessage, updateMessage, deleteMessage };

// // show chat messages
// const getMessage = async (req, res) => {
//   try {
//     const { id: recieverId } = req.params;
//     const senderId = req.user.id;

//     const chat = await Chat.findOne({
//       participants: { $all: [senderId, recieverId] },
//     }).populate("messages");

//     if (!chat) {
//       return res.status(200).json([]);
//     }

//     res.status(200).json(chat.messages);

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };
// const sendMessage = async (req, res) => {
//   try {
//     const { message, chatId , recieverId } = req.body;
//     // const { id: recieverId, } = req.params;
//     const senderId = req.user.id;

//     // console.log("message", message, "reciever", recieverId, "sender", senderId );

//     let chat = await Chat.findOne({
//       participants: { $all: [senderId, recieverId] },
//     });

//     if (!chat) {
//       let reciever = await User.findById(recieverId);
//       chat = await Chat.create({
//         participants: [senderId, recieverId],
//         chatName: reciever.fullName,
//       });
//     }

//     const newMessage = new Massage({
//       senderId,
//       recieverId,
//       message,
//       chatId: chat._id,
//     });

//     if (newMessage) {
//       chat.messages.push(newMessage.id);
//     }

//     await chat.save();
//     await newMessage.save();

//     // Socket io
//     // const recieverIdSocket = getRecieverIdSocket(recieverId)
//     // if (recieverIdSocket) {
//     //   io.to(recieverIdSocket).emit("newMessage", newMessage)
//     // }

//     res.status(200).json(newMessage);
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };
// chat.messages = await Promise.all(
//   chat.messages.map(async (message) => {
//     const sender = await User.findById(message.senderId);
//     return {
//       ...message,
//       senderImage: sender.profilePic,
//       senderName: sender.fullName,
//     };
//   })
// );
