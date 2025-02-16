import GroupMesages from "../schema/groupMessages.js";


const saveMessages = async (data) => {
    // {
    //     id: '6790f5113e21dc321582cdc4',
    //     text: 'हुई',
    //     sender: 'vipin kumar',
    //     avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    //     socketId: 'E2-DR731SIxiL44-AAAL'
    //   }

    const newMessage = new GroupMesages(data);
    newMessage.save();


}

export {saveMessages};