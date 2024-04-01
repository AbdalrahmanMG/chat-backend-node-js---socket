const { boolean } = require("joi");
const mongoose = require("mongoose");

let chatSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
    },
    chatPic:{
      type: String,
      default: 'https://i.ibb.co/HXGbzTJ/icons-5235125-1280.webp'
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required:true
      },
    ],
    // messages: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Message",
    //     default: [],
    //   },
    // ],
    isGroup:{
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

chatSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
chatSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Chat", chatSchema);
