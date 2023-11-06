import mongoose  from "mongoose";
import jwt from "jsonwebtoken"

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        public_id: String,
        url: String
    },
    admins: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the users who are administrators of the group
        },
    ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the user who created the group
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the users who are members of the group
        },
    ],
    joinRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the users who have requested to join the group
        },
    ],

    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message', // Reference to messages in the group chat
      }],

      sharedLink: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SharedLink',
    },
   
 
});







export const Group = mongoose.model('Group', groupSchema);