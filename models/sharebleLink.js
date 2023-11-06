import mongoose from 'mongoose';

const sharedLinkSchema = new mongoose.Schema({
    linkId: String, // The unique link ID generated for the group link
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group', // Reference to the group associated with the link
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the user who shared the link
    },
    // Add any other fields you may need (e.g., expiration date)
});

export const SharedLink = mongoose.model('SharedLink', sharedLinkSchema);
