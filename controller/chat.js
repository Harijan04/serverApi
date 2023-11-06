import { asyncError } from "../middleware/error.js";
import { Message } from "../models/chat.js";
import { Group } from "../models/group.js";
import ErrorHandler from "../utils/error.js";
import io from "../server.js"


export const createChat = asyncError(async(req,res,next)=>{

    const groupId = await Group.findById(req.params.id)

    if(!groupId) return next(new ErrorHandler('Group not found',400))

    if(!groupId.members.includes(req.user._id)) return next(new ErrorHandler('You are not in the group'))
   
    const text=req.body.text
  
    const chats= await Message.create({text,sender:req.user._id,  group:groupId});

    await chats.save()
    groupId.messages.push(chats._id)
  
     await groupId.save()


     io.to(groupId._id).emit("groupMessage", {
        text: text,
        sender: req.user._id,
      });

    res.status(201).json({message:'Message sent',chats})




})


export const getAllChat = asyncError(async(req,res,next)=>{
    const messages=await Message.find().populate('sender')
    res.status(200).json({messages})
})


export const deleteChat = asyncError(async (req, res, next) => {
    try {
        // Find the message by its ID
        const message = await Message.findByIdAndRemove(req.params.id);

        // Check if the message exists
        if (!message) return next(new ErrorHandler("Message not found", 400));

        // Check if the user is the sender of the message
        if (String(message.sender) !== String(req.user._id)) {
            return next(new ErrorHandler("You can only delete your own messages", 403));
        }

        // Remove the message ID from the group's "messages" array
        await Group.updateMany({}, { $pull: { messages: req.params.id } });

        res.status(200).json({
            success: true,
            message: "Chat deleted",
        });
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error deleting message:", error);

        // Send an error response with details
        return next(new ErrorHandler("An error occurred while deleting the message", 500));
    }
});


export const getGroupMessages = asyncError(async (req, res, next) => {
    const groupId = req.params.groupId; // Assuming you get the groupId from the request parameters

    // Check if the group exists
    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    // Check if the user is a member of the group (optional, if you want to restrict access)
    if (!group.members.includes(req.user._id)) {
        return next(new ErrorHandler("You are not in this group", 403));
    }

    // Retrieve messages for the group
    const messages = await Message.find({ group: groupId }).populate("sender");

    res.status(200).json({ messages });
});

