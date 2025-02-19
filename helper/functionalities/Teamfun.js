
import User from "../../schema/users.schema.js";


const finduser =async(id)=>{
    const user = await User.findOne({_id:id})
    return user
}

export {
    finduser
}