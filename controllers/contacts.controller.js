const { User } = require("../models/user.model");
const Chat = require("../models/chat.model.js");
const Message = require("../models/message.model.js");

// get all contacts except me 
const getContactsSideBar = async (req, res) => {
  try {
    const loggedUserId = req.user.id;
    const allContacts = await User.find({
      id: {
        $ne: loggedUserId,
      },
    }).select("-password");

    let modifiedContacts = allContacts.map(c=>({
      id: c._id,
      fullName: c.fullName,
      profilePic: c.profilePic,
    }))

    return res.status(200).json(modifiedContacts);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get all chats
const getChats = async (req, res) => {
  const loggedUserId = req.user.id;
  try {
    let chats = await Chat.find({ participants: loggedUserId }).populate(
      "participants",
      "-password"
    );

    if (!chats) {
      return res.status(400).json({success: false, message:"No chats found"})
    }

    for (let chat of chats) {
      let lastMessage = await Message.findOne({ chatId: chat._id }).sort({
        createdAt: -1,
      });
      chat.lastMessage = lastMessage;
    }

    const formattedChats = chats.map((chat) => ({
      _id: chat._id,
      chatPic: chat.chatPic,
      participants: chat.participants,
      lastMessage: chat.lastMessage,
      chatName: chat.chatName,
      createdAt: chat.createdAt,
      updatedAt: chat.upda
    }));

    return res.status(200).json(formattedChats);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// create chat 
const createGroupChat = async (req, res) => {
  try {
    const loggedUserId = req.user.id;
    const { userId, participants, chatName, chatPic, isGroup } = req.body;

    let chat = await Chat.findOne({
      participants: { $all: [loggedUserId, userId], $size: 2 },
      isGroup: false
    })
    console.log("exist chat already",chat);


    if (!chat) {
      chat = await Chat.create({
        participants: [loggedUserId, ...participants],
        isGroup,
        chatPic,
        chatName,
      });
    }

    chat = await Chat.findById(chat._id).populate("participants");
    console.log('new chat',chat);

    return res.status(200).json({ success: true, chat });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getContactsSideBar, getChats , createGroupChat};
