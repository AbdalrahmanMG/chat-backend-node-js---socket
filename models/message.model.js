const mongoose = require("mongoose");

let messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recieverId: { //do you really need this ?????????
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chatId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required:true
  },
  message:{
    type: String,
    requried:true
  },
  senderImage: {
    type: String 
  },
  senderName: {
    type: String 
  },
}, {timestamps: true});

messageSchema.virtual('id').get(function (){
  return this._id.toHexString()
})
messageSchema.set('toJSON',{
  virtuals:true
})

module.exports = mongoose.model("Message", messageSchema);
