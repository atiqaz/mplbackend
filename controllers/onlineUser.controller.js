

import onlineUser  from "../schema/socket.schema.js"

const saveuser = async (data) => {
    try {
      // Check if the user already exists in the database based on userId
      const userData = await onlineUser.findOneAndUpdate(
        { userId: data._id }, // Search by userId
        {
          $set: {
            socketId: data.socketId,
            name: data.name,
            image:data.imageUrl
          },
        },
        {
          new: true, // Return the updated document
          upsert: true, // Create a new document if none exists
        }
      );
  
     
    } catch (error) {
      console.error("Error saving or updating user:", error);
    }
  };
  

const getOnlineuser =async(socketId)=>{
    const users = await onlineUser.find({socketId:{$ne:socketId}})
    // const users = await onlineUser.find()

    return users
}

export {saveuser ,getOnlineuser}