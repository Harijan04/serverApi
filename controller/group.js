
import { asyncError } from '../middleware/error.js'
import { Group } from '../models/group.js'
import { SharedLink } from '../models/sharebleLink.js'
import { User } from '../models/user.js'
import ErrorHandler from '../utils/error.js'
import { generateUniqueToken, getDataUris } from '../utils/features.js'
import { v4 as uuidv4 } from 'uuid';
import cloudinary from 'cloudinary'



// export const getGroups = asyncError(async (req, res, next) => {
//     const group = await Group.find().populate("members").populate("messages")
//     res.status(201).json({ success: true, data: group })
// })

export const getGroups = asyncError(async (req, res, next) => {
    const userId = req.user._id; // Get the user's ID from the authenticated request

    // Find all groups where the user's ID is in the 'admins' or 'members' arrays
    const groups = await Group.find({
        $or: [
            { admins: userId },
            { members: userId }
        ]
    }).populate({
        path: 'messages',
        populate: {
            path: 'sender', // Populate the 'sender' field within 'messages'
            model: 'User',  // The model to use for populating 'sender'
        },
    });

    res.status(200).json({ success: true, groups });
});

export const getgroupMember = asyncError(async (req, res, next) => {
    const getall = await Group.find().populate("members")
    res.status(201).json({ getall })
})

export const createGroup = asyncError(async (req, res, next) => {
    const { name } = req.body;
    const creator = req.user._id; // Get the ID of the user creating the group
    let  image = undefined;

    // Check if a file (avatar) was uploaded
    if (req.file) {
        const file = getDataUris(req.file);
        // Upload the file to Cloudinary
        const mycloud = await cloudinary.v2.uploader.upload(file.content);

        // Create an avatar object with the public_id and URL
        image = {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        };
    }

    // Check if a group with the same name already exists (you can implement your own validation logic)
    const existingGroup = await Group.findOne({ name });

    if (existingGroup) {
        return res.status(400).json({ success: false, message: 'A group with the same name already exists' });
    }

    // Create the group with the avatar
    const group = new Group({
        name,
        creator, // Set the creator of the group
        admins: [creator], // Make the creator an admin
        members: [creator], // Add the creator as a member
        image, // Add the avatar to the group
    });

    // Save the group to the database
    await group.save();

    res.status(201).json({ success: true, message: 'Group created', group });
});

// addUsersToGroupController.js



// addGroupMembersController.js


// addMemberToGroupController.js



// addMemberToGroupController.js



// Modify the controller to handle an array of users
export const addMemberToGroup = async (req, res, next) => {
    try {

        // Retrieve the group ID from the request parameters
        const groupId = req.params.groupId;

        // Retrieve the users to be added from the request body as an array
        const { users } = req.body;


        // Find the group in the database
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if the user making the request is an admin of the group
        if (!group.admins.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to add members to this group' });
        }

        // Iterate through the users and add them to the group
        for (const user of users) {
            // Check if the user is already a member of the group
            if (!group.members.includes(user)) {
                group.members.push(user);
            } else {
                throw new Error('User is already a member');
            }
        }


        // Update the users' `groups` array with the group's ID
        const userPromises = users.map(async (memberId) => {
            const user = await User.findById(memberId);
            if (user) {
                user.groups.push(groupId);
                await user.save();
            }
        });

        await Promise.all(userPromises);


        // Save the updated group to the database
        await group.save();

        res.json({ success: true, data: group });
    } catch (error) {
        next(error);
    }
};


///Update group

// updateGroupController.js



export const updateGroup = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.user._id; // The user making the request

        // Find the group in the database
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if the user making the request is the admin of the group
        if (group.admin.includes(userId)) {
            // Perform the group update here
            group.name = req.body.name;

            // Save the updated group to the database
            await group.save();

            res.json({ success: true, message: 'Group updated successfully' });
        } else {
            return res.status(403).json({ success: false, message: 'You are not authorized to update this group' });
        }
    } catch (error) {
        next(error);
    }
};


///send join request

export const sendJoinRequest = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.body.user; // Extract the user ID from the request body

        // Find the group in the database
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if the user is already a member of the group
        if (group.members.includes(userId)) {
            return res.status(400).json({ success: false, message: 'You are already a member of this group' });
        }

        // Check if the user has already sent a join request
        if (group.joinRequests.includes(userId)) {
            return res.status(400).json({ success: false, message: 'You have already sent a join request for this group' });
        }

        // Add the user to the joinRequests array
        group.joinRequests.push(userId);

        // Save the updated group to the database
        await group.save();

        res.json({ success: true, message: 'Join request sent successfully' });
    } catch (error) {
        next(error);
    }
};


// approveJoinRequestController.js



// approveJoinRequestController.js


export const approveJoinRequest = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.params.userId; // The user to approve

        // Find the group in the database
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if the user making the request is an admin of the group
        if (!group.admin.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to approve join requests for this group' });
        }

        // Check if the user to approve is in the joinRequests array
        if (!group.joinRequests.includes(userId)) {
            return res.status(400).json({ success: false, message: 'User has not sent a join request for this group' });
        }

        // Remove the user from joinRequests and add them to the members array
        group.joinRequests.pull(userId);
        group.members.push(userId);

        // Save the updated group to the database
        await group.save();

        res.json({ success: true, message: 'Join request approved successfully' });
    } catch (error) {
        next(error);
    }
};


// cancelJoinRequestController.js



export const cancelJoinRequest = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;

        // Find the group in the database
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if the user's ID is in the joinRequests array
        if (!group.joinRequests.includes(req.user._id)) {
            return res.status(400).json({ success: false, message: 'You have not sent a join request for this group' });
        }

        // Remove the user's ID from the joinRequests array
        group.joinRequests.pull(req.user._id);

        // Save the updated group to the database
        await group.save();

        res.json({ success: true, message: 'Join request canceled successfully' });
    } catch (error) {
        next(error);
    }
};





///User exist method
// exitGroupController.js



export const exitGroup = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.user._id; // The user who is leaving

        // Find the group in the database
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if the user is a member of the group
        if (!group.members.includes(userId)) {
            return res.status(400).json({ success: false, message: 'You are not a member of this group' });
        }

        // Remove the user from the members array
        group.members.pull(userId);

        // Save the updated group to the database
        await group.save();



        const user = await User.findById(userId)
        if (user) {
            user.groups.pull(groupId);
            await user.save();


        }

        res.json({ success: true, message: 'You have left the group' });
    } catch (error) {
        next(error);
    }
};

//remover user group the group
export const removeUserFromGroup = asyncError(async (req, res, next) => {
    // Find the group by its ID
    const group = await Group.findById(req.params.id);

    if (!group) {
        return next(new ErrorHandler("Group not found", 404));
    }

    // Check if the user performing the action is an admin of the group
    if (String(group.admin) !== String(req.user._id)) {
        return next(new ErrorHandler("You are not the admin of this group", 403));
    }

    // Get the user to be removed (specified in the route parameter)
    const userToBeRemovedId = req.params.userId;

    // Check if the user to be removed is a member of the group
    if (!group.members.includes(userToBeRemovedId)) {
        return next(new ErrorHandler("User is not a member of this group", 400));
    }

    // Remove the user from the group's "members" array
    group.members.pull(userToBeRemovedId);

    // Save the updated group
    await group.save();

    // Remove the group from the user's "groups" array
    const user = await User.findById(userToBeRemovedId);
    if (user) {
        user.groups.pull(req.params.id);
        await user.save();
    }

    res.status(200).json({
        success: true,
        message: "User removed from the group",
    });
});



export const deleteGroup = asyncError(async (req, res, next) => {
    const groupId = req.params.id;
    const group = await Group.findById(groupId);

    if (!group) {
        return next(new ErrorHandler('Group Not Found', 404));
    }

    if (String(group.admin) !== String(req.user._id)) {
        return next(new ErrorHandler("You are not the admin of this group", 403));
    }

    // Find all users who are members of this group
    const groupMembers = await User.find({ groups: groupId });

    // Remove the group from each member's "groups" array
    groupMembers.forEach(async (user) => {
        user.groups.pull(groupId);
        await user.save();
    });

    // Delete the group
    await Group.deleteOne({ _id: groupId });

    res.status(200).json({
        success: true,
        message: 'Group Deleted Successfully',
    });
});








export const groupChats = asyncError(async (req, res, next) => {
    const group = await Group.find().populate('messages')
        .sort({ createdAt: -1 })
        .exec()
    console.log("group", group)
    res.status(200).json({
        success: true,
        data: group
    })
})



/// sharelink
export const shareGroupLink = async (req, res, next) => {
    const groupId = req.params.groupId; // Get the group ID from the request.

    // Find the user and group based on the provided IDs
    const user = await User.findById(req.user._id);
    const group = await Group.findById(groupId);

    // Check if the user is a group admin
    const isAdmin = group.admin.some(adminId => adminId.equals(user._id));

    if (!isAdmin) {
        return next(new ErrorHandler('You must be a group admin to share the group link', 403));
    }

    // Check if there's an existing shared link for the group
    const existingSharedLink = await SharedLink.findOne({ groupId });

    // Generate a unique link ID for the group link
    const linkId = uuidv4();

    // Construct the group join link (you can customize the URL format)
    const joinLink = `https://example.com/groups/${groupId}/join/${linkId}`;

    if (existingSharedLink) {
        // If an existing shared link exists, update its linkId
        existingSharedLink.linkId = linkId;
        existingSharedLink.joinLink = joinLink;
        await existingSharedLink.save();
    } else {
        // If no existing shared link, create a new shared link
        const sharedLink = new SharedLink({
            linkId,
            groupId,
            senderId: user._id,
            joinLink, // Store the generated group join link
        });
        // Save the shared link in the database
        await sharedLink.save();

        group.sharedLink = sharedLink._id;
        await group.save();
    }

    res.status(200).json({ success: true, joinLink });
};







//join the group using the joining link
export const joinGroupWithLink = async (req, res, next) => {
    const groupId = req.params.groupId; // Get the group ID from the request.
    const linkId = req.params.linkId; // Get the shared link ID from the request.

    // Validate the link by looking it up in the database
    const sharedLink = await SharedLink.findOne({ linkId, groupId });

    if (!sharedLink) {
        return res.status(404).json({ success: false, message: 'Invalid or expired link' });
    }

    // Check if the user is already a member of the group
    if (sharedLink.senderId.equals(req.user._id)) {
        return res.status(400).json({ success: false, message: 'You are already a member of the group' });
    }

    // Find the group based on the provided group ID
    const group = await Group.findById(groupId);

    // Add the user to the group's members array (req.user is the user who is joining)
    group.members.push(req.user._id);

    // Save changes to the group
    await group.save();

    // Mark the shared link as used or expired (you need to implement this method in the model)

    res.status(200).json({ success: true, message: 'You have successfully joined the group.' });
};


export const getShareLink=asyncError(async(req,res,next)=>{
    const groupId = req.params.groupId; // Get the group ID from the request.

    // Find the group based on the provided group ID
    const group = await Group.findById(groupId).populate('sharedLink');

    if (!group) {
        return next(new ErrorHandler('Group not found', 404));
    }

    res.status(200).json({
        success: true,
        message:`http://localhost:3000/api/v1/groups/${groupId}/join/${group.sharedLink.linkId}`,
        data: group.sharedLink,
    });
})



