import Conversations from "../schema/conversation.schema.js";


const individualConversationSave = async (data) => {
  
    const newMessage = new Conversations(data);
    newMessage.save();


}

const getAllMessagesPrivate =async(data)=>{
const {senderId,recieverId}=data
console.log(data)
// const finder = await Conversations.find({senderId:senderId,recieverId:recieverId})
const finder = await Conversations.find({$or:[{senderId:senderId,recieverId:recieverId},{senderId:recieverId,recieverId:senderId}]})
console.log(finder)
return finder
}

export { individualConversationSave ,getAllMessagesPrivate };